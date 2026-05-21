import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.63.243.122', 'localhost:3000', 'localhost:3001'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
