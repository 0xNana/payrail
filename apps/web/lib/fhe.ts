import type { Address, PublicClient, WalletClient } from "viem";
import { TARGET_PAYROLL_CHAIN_ID, TARGET_PAYROLL_CHAIN_NAME } from "@/lib/targetChain";

type CofheChainsModule = typeof import("@cofhe/sdk/chains");
type CofheCoreModule = typeof import("@cofhe/sdk");
type TfheModule = typeof import("tfhe");

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

let cofheChainsModulePromise: Promise<CofheChainsModule> | null = null;
let cofheCoreModulePromise: Promise<CofheCoreModule> | null = null;
let tfheModulePromise: Promise<TfheModule> | null = null;
let tfheInitPromise: Promise<void> | null = null;

function getCofheChainsModule() {
  if (!cofheChainsModulePromise) {
    cofheChainsModulePromise = import("@cofhe/sdk/chains");
  }
  return cofheChainsModulePromise;
}

function getCofheCoreModule() {
  if (!cofheCoreModulePromise) {
    cofheCoreModulePromise = import("@cofhe/sdk");
  }
  return cofheCoreModulePromise;
}

function getTfheModule() {
  if (!tfheModulePromise) {
    tfheModulePromise = import("tfhe");
  }
  return tfheModulePromise;
}

function assertSupportedChain(chainId: number) {
  if (chainId !== TARGET_PAYROLL_CHAIN_ID) {
    throw new Error(
      `CoFHE is configured for ${TARGET_PAYROLL_CHAIN_NAME} (${TARGET_PAYROLL_CHAIN_ID}). Switch network and retry.`
    );
  }
}

function createWebStorage() {
  const memoryStorage = new Map<string, string>();

  const getStorage = () => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  };

  return {
    getItem: async (name: string) => {
      const storage = getStorage();
      if (storage) {
        return storage.getItem(name);
      }
      return memoryStorage.get(name) ?? null;
    },
    setItem: async (name: string, value: unknown) => {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      const storage = getStorage();
      if (storage) {
        storage.setItem(name, serialized);
        return;
      }
      memoryStorage.set(name, serialized);
    },
    removeItem: async (name: string) => {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(name);
        return;
      }
      memoryStorage.delete(name);
    },
  };
}

function fromHexString(hexString: string): Uint8Array {
  const cleanString = hexString.length % 2 === 1 ? `0${hexString}` : hexString;
  const arr = cleanString.replace(/^0x/, "").match(/.{1,2}/g);
  if (!arr) return new Uint8Array();
  return new Uint8Array(arr.map((byte) => Number.parseInt(byte, 16)));
}

async function initTfhe() {
  if (!tfheInitPromise) {
    tfheInitPromise = (async () => {
      const tfheModule = await getTfheModule();
      await tfheModule.default();
      await tfheModule.init_panic_hook();
    })();
    await tfheInitPromise;
    return true;
  }

  await tfheInitPromise;
  return false;
}

async function createBrowserCofheClient() {
  const [chainsModule, coreModule, tfheModule] = await Promise.all([
    getCofheChainsModule(),
    getCofheCoreModule(),
    getTfheModule(),
  ]);

  const tfhePublicKeyDeserializer = (buff: string) => {
    tfheModule.TfheCompactPublicKey.deserialize(fromHexString(buff));
  };

  const compactPkeCrsDeserializer = (buff: string) => {
    tfheModule.CompactPkeCrs.deserialize(fromHexString(buff));
  };

  const zkBuilderAndCrsGenerator = (fhe: string, crs: string) => {
    const fhePublicKey = tfheModule.TfheCompactPublicKey.deserialize(fromHexString(fhe));
    const zkBuilder = tfheModule.ProvenCompactCiphertextList.builder(fhePublicKey);
    const zkCrs = tfheModule.CompactPkeCrs.deserialize(fromHexString(crs));

    return { zkBuilder, zkCrs };
  };

  const config = coreModule.createCofheConfigBase({
    environment: "web",
    supportedChains: [chainsModule.getChainById(TARGET_PAYROLL_CHAIN_ID)!],
    fheKeyStorage: createWebStorage(),
    useWorkers: false,
  });

  return coreModule.createCofheClientBase({
    config,
    zkBuilderAndCrsGenerator,
    tfhePublicKeyDeserializer,
    compactPkeCrsDeserializer,
    initTfhe,
  });
}

type CofheClient = Awaited<ReturnType<typeof createBrowserCofheClient>>;
let cofheClientPromise: Promise<CofheClient> | null = null;

async function getCofheClient() {
  if (!cofheClientPromise) {
    cofheClientPromise = createBrowserCofheClient();
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
