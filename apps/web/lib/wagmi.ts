import { createConfig, http } from "wagmi";
import type { Chain } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { targetPayrollChain } from "@/lib/targetChain";

export const localhost: Chain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
};

export const chains = [targetPayrollChain, localhost] as const;

const arbitrumSepoliaRpc = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL;

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected()],
  transports: {
    [targetPayrollChain.id]: arbitrumSepoliaRpc ? http(arbitrumSepoliaRpc) : http(),
    [localhost.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
