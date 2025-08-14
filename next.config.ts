import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ["avatars.githubusercontent.com", "img.clerk.com"],
  },
  eslint:{
    ignoreDuringBuilds: true,
  },
  typescript:{
    ignoreBuildErrors:true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
