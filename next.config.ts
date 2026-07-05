import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingExcludes: {
    "*": ["./_workspace/**/*"],
  },
  serverExternalPackages: ["better-sqlite3", "exceljs"],
  devIndicators: false,
};

export default nextConfig;
