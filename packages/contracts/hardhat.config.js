require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("@typechain/hardhat");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");

const path = require("node:path");
const dotenv = require("dotenv");
const { vars } = require("hardhat/config");

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env.local") });
dotenv.config();

const MNEMONIC = vars.get(
  "MNEMONIC",
  "test test test test test test test test test test test junk"
);

const ARBITRUM_SEPOLIA_RPC_URL =
  process.env.ARBITRUM_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  defaultNetwork: "hardhat",
  namedAccounts: { deployer: 0 },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY ?? vars.get("ARBISCAN_API_KEY", "")
    }
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false
  },
  networks: {
    hardhat: {
      accounts: { mnemonic: MNEMONIC },
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 421614
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    deploy: "./deploy",
    artifacts: "./artifacts",
    cache: "./cache"
  },
  solidity: {
    version: "0.8.27",
    settings: {
      metadata: { bytecodeHash: "none" },
      optimizer: { enabled: true, runs: 800 },
      evmVersion: "cancun"
    }
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6"
  }
};

module.exports = config;
