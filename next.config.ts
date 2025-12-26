import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  // output: 'export', // Disabled to support dynamic routes
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
