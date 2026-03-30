import { NextResponse } from "next/server";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyCompanyOwnership } from "@/lib/apiAuth";

const ENCRYPTION_KEY_REF = "v1";

function getEncryptionKey(): Buffer {
  const hex = process.env.IDENTITY_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("IDENTITY_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

function decryptField(payload: string | null): string {
  if (!payload) return "";
  const key = getEncryptionKey();
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function encryptField(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function hmacField(value: string): string {
  const secret = process.env.IDENTITY_HMAC_SECRET;
  if (!secret) throw new Error("IDENTITY_HMAC_SECRET env var is missing");
  return createHmac("sha256", secret).update(value.toLowerCase().trim()).digest("hex");
}

async function resolveOwnedEmployment(employment_chain_binding_id: string, caller_wallet: string) {
  const { data: binding, error: bindingErr } = await supabaseAdmin
    .from("employment_chain_binding")
    .select("employment_id, company_onchain_binding_id")
    .eq("employment_chain_binding_id", employment_chain_binding_id)
    .single();

  if (bindingErr || !binding) {
    return { error: NextResponse.json({ error: { message: "employment_chain_binding not found" } }, { status: 404 }) };
  }

  const ownershipError = await verifyCompanyOwnership({
    company_onchain_binding_id: binding.company_onchain_binding_id,
    caller_wallet,
  });
  if (ownershipError) {
    return { error: NextResponse.json({ error: ownershipError }, { status: 403 }) };
  }

  const { data: employment, error: employmentErr } = await supabaseAdmin
    .from("employment")
    .select("person_id")
    .eq("employment_id", binding.employment_id)
    .single();

  if (employmentErr || !employment) {
    return { error: NextResponse.json({ error: { message: "employment not found" } }, { status: 404 }) };
  }

  return { personId: employment.person_id };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const employment_chain_binding_id = url.searchParams.get("employment_chain_binding_id") ?? "";
    const caller_wallet = req.headers.get("x-employer-wallet") ?? "";

    if (!employment_chain_binding_id) {
      return NextResponse.json(
        { error: { message: "Missing employment_chain_binding_id" } },
        { status: 400 }
      );
    }

    const resolved = await resolveOwnedEmployment(employment_chain_binding_id, caller_wallet);
    if ("error" in resolved) return resolved.error;

    const { data: identity, error: identityErr } = await supabaseAdmin
      .from("person_identity")
      .select("given_name_enc, family_name_enc, dni_type, dni_value_enc, email_enc")
      .eq("person_id", resolved.personId)
      .single();

    if (identityErr || !identity) {
      return NextResponse.json({ error: { message: "person_identity not found" } }, { status: 404 });
    }

    return NextResponse.json({
      given_name: decryptField(identity.given_name_enc),
      family_name: decryptField(identity.family_name_enc),
      dni_type: identity.dni_type,
      dni_value: decryptField(identity.dni_value_enc),
      email: identity.email_enc ? decryptField(identity.email_enc) : "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const caller_wallet = req.headers.get("x-employer-wallet") ?? "";
    const {
      employment_chain_binding_id,
      given_name,
      family_name,
      dni_type,
      dni_value,
      email,
    } = body ?? {};

    if (!employment_chain_binding_id) {
      return NextResponse.json(
        { error: { message: "Missing employment_chain_binding_id" } },
        { status: 400 }
      );
    }

    const resolved = await resolveOwnedEmployment(employment_chain_binding_id, caller_wallet);
    if ("error" in resolved) return resolved.error;

    const updates: Record<string, string | null> = {
      encryption_key_ref: ENCRYPTION_KEY_REF,
    };
    let changed = false;

    if (given_name !== undefined) {
      updates.given_name_enc = encryptField(String(given_name).trim());
      changed = true;
    }
    if (family_name !== undefined) {
      updates.family_name_enc = encryptField(String(family_name).trim());
      changed = true;
    }
    if (dni_type !== undefined) {
      updates.dni_type = String(dni_type);
      changed = true;
    }
    if (dni_value !== undefined) {
      const dni = String(dni_value).trim();
      updates.dni_value_enc = encryptField(dni);
      updates.dni_search_hmac = hmacField(dni);
      changed = true;
    }
    if (email !== undefined) {
      const normalized = email === null ? null : String(email).trim();
      updates.email_enc = normalized ? encryptField(normalized) : null;
      changed = true;
    }

    if (!changed) {
      return NextResponse.json({ error: { message: "No PII fields provided" } }, { status: 400 });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("person_identity")
      .update(updates)
      .eq("person_id", resolved.personId);

    if (updateErr) return NextResponse.json({ error: updateErr }, { status: 500 });

    const { data: identity, error: identityErr } = await supabaseAdmin
      .from("person_identity")
      .select("given_name_enc, family_name_enc, dni_type, dni_value_enc, email_enc")
      .eq("person_id", resolved.personId)
      .single();

    if (identityErr || !identity) {
      return NextResponse.json({ error: { message: "Failed to reload person_identity" } }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      identity: {
        given_name: decryptField(identity.given_name_enc),
        family_name: decryptField(identity.family_name_enc),
        dni_type: identity.dni_type,
        dni_value: decryptField(identity.dni_value_enc),
        email: identity.email_enc ? decryptField(identity.email_enc) : "",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
