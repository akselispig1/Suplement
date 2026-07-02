import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so a stray lockfile in a parent folder (e.g. the
  // user's home directory) can't make Next.js misdetect the workspace root
  // and skip the Tailwind/CSS pipeline (which renders the site unstyled/white).
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: [],
};

export default nextConfig;
