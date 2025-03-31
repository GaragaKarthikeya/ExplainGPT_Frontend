import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // This allows the build to continue even if ESLint errors exist
  },
};

export default nextConfig;
