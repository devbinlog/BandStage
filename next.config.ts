import type { NextConfig } from "next";

const allowedOrigins = ["http://localhost:3000", process.env.NEXT_PUBLIC_SITE_URL].filter(
  Boolean,
) as string[];

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins,
    },
  },
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
