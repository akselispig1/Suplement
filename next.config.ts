import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  // Stripe webhook needs raw body
  serverExternalPackages: [],
};

export default nextConfig;
