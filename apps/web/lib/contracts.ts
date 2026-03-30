import type { Abi, Address } from "viem";
import { sdkByChainId } from "@payrail/sdk";

export type DeployedContractRef = { address: Address; abi: Abi };

export type PayrailSdkContracts = {
  PayrailFactoryRegistry: DeployedContractRef;
  PayrailToken: DeployedContractRef;
  PayrailAbi: Abi; // ABI only (Payrail deployed dynamically by registry)
};

export function getContracts(chainId: number): PayrailSdkContracts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdk: any = (sdkByChainId as any)[chainId];
  if (!sdk) throw new Error(`Unsupported chainId: ${chainId}`);

  const PayrailFactoryRegistry = sdk.PayrailFactoryRegistry;
  const PayrailToken = sdk.PayrailToken;
  const PayrailAbi = sdk.PayrailAbi;

  if (!PayrailFactoryRegistry || !PayrailToken || !PayrailAbi) {
    throw new Error(
      `SDK missing required exports for chainId=${chainId}. ` +
        `Expected PayrailFactoryRegistry, PayrailToken, and PayrailAbi exports. ` +
        `Did you run contracts:export for that network?`
    );
  }

  return { PayrailFactoryRegistry, PayrailToken, PayrailAbi };
}

export function tryGetContracts(chainId: number): PayrailSdkContracts | null {
  try {
    return getContracts(chainId);
  } catch {
    return null;
  }
}
