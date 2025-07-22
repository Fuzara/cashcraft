import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@declarations": path.resolve(__dirname, "src/declarations"),
    };
    return config;
  },
  transpilePackages: ["declarations"],
};

export default nextConfig;
