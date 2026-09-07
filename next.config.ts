import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js is added in Phase 4; it needs transpiling for the App Router.
  transpilePackages: ["three"],
};

export default nextConfig;
