import type { Address, PublicClient, WalletClient } from "viem";
import { TARGET_PAYROLL_CHAIN_ID, TARGET_PAYROLL_CHAIN_NAME } from "@/lib/targetChain";

type CofheChainsModule = typeof import("@cofhe/sdk/chains");
type CofheWebModule = typeof import("@cofhe/sdk/web");
type CofheClient = Awaited<ReturnType<CofheWebModule["createCofheClient"]>>;

const SECURITY_ZONE = 0;
const FHE_TYPE_UINT64 = 5;
const FHE_TYPE_UINT128 = 6;

type EncryptableNumberInput = {
  data: bigint;
  securityZone: number;
  utype: number;
};

type CofheEncryptedInput = {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: string;
};

type EncryptedUint64Input = CofheEncryptedInput;
type EncryptedUint128Input = CofheEncryptedInput;

let cofheClientPromise: Promise<CofheClient> | null = null;
let cofheChainsModulePromise: Promise<CofheChainsModule> | null = null;
let cofheWebModulePromise: Promise<CofheWebModule> | null = null;

function getCofheChainsModule() {
  if (!cofheChainsModulePromise) {
    cofheChainsModulePromise = import("@cofhe/sdk/chains");
  }
  return cofheChainsModulePromise;
}

function getCofheWebModule() {
  if (!cofheWebModulePromise) {
    cofheWebModulePromise = import("@cofhe/sdk/web");
  }
  return cofheWebModulePromise;
}

function assertSupportedChain(chainId: number) {
  if (chainId !== TARGET_PAYROLL_CHAIN_ID) {
    throw new Error(
      `CoFHE is configured for ${TARGET_PAYROLL_CHAIN_NAME} (${TARGET_PAYROLL_CHAIN_ID}). Switch network and retry.`
    );
  }
}

async function getCofheClient() {
  if (!cofheClientPromise) {
    cofheClientPromise = Promise.all([
      getCofheChainsModule(),
      getCofheWebModule(),
    ]).then(([chainsModule, webModule]) =>
      webModule.createCofheClient(
        webModule.createCofheConfig({
          supportedChains: [chainsModule.getChainById(TARGET_PAYROLL_CHAIN_ID)!],
        })
      )
    );
  }

  return cofheClientPromise;
}

async function connectClient(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}) {
  assertSupportedChain(params.chainId);

  if (!params.walletClient.account) {
    throw new Error("Wallet not connected.");
  }

  const client = await getCofheClient();
  await client.connect(params.publicClient, params.walletClient);
  return client;
}

async function ensureSelfPermit(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Address;
}) {
  const client = await connectClient(params);
  await client.permits.getOrCreateSelfPermit(params.chainId, params.account, {
    issuer: params.account,
    name: "Payrail self permit",
  });
  return client;
}

function createEncryptableUint64(value: bigint): EncryptableNumberInput {
  return {
    data: value,
    securityZone: SECURITY_ZONE,
    utype: FHE_TYPE_UINT64,
  };
}

function createEncryptableUint128(value: bigint): EncryptableNumberInput {
  return {
    data: value,
    securityZone: SECURITY_ZONE,
    utype: FHE_TYPE_UINT128,
  };
}

export async function encryptUint64(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  userAddress: Address;
  value: bigint;
}): Promise<EncryptedUint64Input> {
  const client = await connectClient(params);
  const [encrypted] = await client
    .encryptInputs([createEncryptableUint64(params.value)])
    .setAccount(params.userAddress)
    .setChainId(params.chainId)
    .execute();

  return encrypted;
}

export async function encryptUint128(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  userAddress: Address;
  value: bigint;
}): Promise<EncryptedUint128Input> {
  const client = await connectClient(params);
  const [encrypted] = await client
    .encryptInputs([createEncryptableUint128(params.value)])
    .setAccount(params.userAddress)
    .setChainId(params.chainId)
    .execute();

  return encrypted;
}

export async function decryptUint64(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Address;
  handle: `0x${string}`;
}) {
  const client = await ensureSelfPermit(params);
  return client
    .decryptForView(params.handle, FHE_TYPE_UINT64)
    .setChainId(params.chainId)
    .setAccount(params.account)
    .withPermit()
    .execute();
}

export async function decryptUint128(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Address;
  handle: `0x${string}`;
}) {
  const client = await ensureSelfPermit(params);
  return client
    .decryptForView(params.handle, FHE_TYPE_UINT128)
    .setChainId(params.chainId)
    .setAccount(params.account)
    .withPermit()
    .execute();
}
