import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
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