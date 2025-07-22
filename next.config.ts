import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@declarations/cashcraft": path.resolve(__dirname, "src/declarations/cashcraft_backend"),
      "@declarations/wallets": path.resolve(__dirname, "src/declarations/wallets_backend_backend"),
      "@declarations/wallets_frontend": path.resolve(__dirname, "src/declarations/wallets_backend_frontend"),
    };
    return config;
  },
  transpilePackages: ["declarations"],
};

export default nextConfig;
