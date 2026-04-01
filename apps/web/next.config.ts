import path from "node:path";
import { createRequire } from "node:module";
import type { NextConfig } from 'next'

const require = createRequire(import.meta.url);
const cofheWebEntry = require.resolve("@cofhe/sdk/web");
const cofheRequire = createRequire(cofheWebEntry);
const tfheEntry = cofheRequire.resolve("tfhe");
const tfheWorkerHelpersPath = path.join(
  path.dirname(tfheEntry),
  "snippets/wasm-bindgen-rayon-9d40dbf53d170728/src/workerHelpers.js"
);
const tfheWorkerHelpersStubPath = path.join(__dirname, "lib/tfheWorkerHelpers.stub.js");
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "frame-src 'self' https:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "wagmi", "viem", "@supabase/supabase-js"],
  },
  turbopack: {},
  transpilePackages: ["@payrail/sdk"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.experiments = Object.assign(config.experiments || {}, {
      asyncWebAssembly: true,
    });
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    if (isServer) {
      config.output.webassemblyModuleFilename = "./../static/wasm/[modulehash].wasm";
    } else {
      config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      tfhe: tfheEntry,
      [tfheWorkerHelpersPath]: tfheWorkerHelpersStubPath,
      // MetaMask SDK 
      "@react-native-async-storage/async-storage": false,

      // WalletConnect logger
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
