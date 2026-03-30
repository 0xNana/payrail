export * from "./types";

import * as localhost from "./generated/localhost";
import * as arbitrumSepolia from "./generated/arbitrumSepolia";

export { arbitrumSepolia, localhost };

export const sdkByChainId = {
  31337: localhost,
  421614: arbitrumSepolia,
} as const;
