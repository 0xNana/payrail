import type { Address, PublicClient, WalletClient } from "viem";
import { TARGET_PAYROLL_CHAIN_ID, TARGET_PAYROLL_CHAIN_NAME } from "@/lib/targetChain";

type EncryptedUint64Input = import("@cofhe/sdk").EncryptedUint64Input;
type EncryptedUint128Input = import("@cofhe/sdk").EncryptedUint128Input;
type CofheSdkModule = typeof import("@cofhe/sdk");
type CofheChainsModule = typeof import("@cofhe/sdk/chains");
type CofheWebModule = typeof import("@cofhe/sdk/web");
type CofheClient = Awaited<ReturnType<CofheWebModule["createCofheClient"]>>;

const SECURITY_ZONE = 0;

let cofheClientPromise: Promise<CofheClient> | null = null;
let cofheSdkModulePromise: Promise<CofheSdkModule> | null = null;
let cofheChainsModulePromise: Promise<CofheChainsModule> | null = null;
let cofheWebModulePromise: Promise<CofheWebModule> | null = null;

function getCofheSdkModule() {
  if (!cofheSdkModulePromise) {
    cofheSdkModulePromise = import("@cofhe/sdk");
  }
  return cofheSdkModulePromise;
}

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

export async function encryptUint64(params: {
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  userAddress: Address;
  value: bigint;
}): Promise<EncryptedUint64Input> {
  const client = await connectClient(params);
  const sdkModule = await getCofheSdkModule();
  const [encrypted] = await client
    .encryptInputs([sdkModule.Encryptable.uint64(params.value, SECURITY_ZONE)])
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
  const sdkModule = await getCofheSdkModule();
  const [encrypted] = await client
    .encryptInputs([sdkModule.Encryptable.uint128(params.value, SECURITY_ZONE)])
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
  const sdkModule = await getCofheSdkModule();
  return client
    .decryptForView(params.handle, sdkModule.FheTypes.Uint64)
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
  const sdkModule = await getCofheSdkModule();
  return client
    .decryptForView(params.handle, sdkModule.FheTypes.Uint128)
    .setChainId(params.chainId)
    .setAccount(params.account)
    .withPermit()
    .execute();
}
