import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minwoumfgutampcgrcbr.supabase.co',
      },
    ],
  },
  typescript: {
    // Ne pas bloquer sur les erreurs TypeScript en production
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
