import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['minwoumfgutampcgrcbr.supabase.co'],
  },
  eslint: {
    // Ne bloquer que sur les erreurs, pas les warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ne pas bloquer sur les erreurs TypeScript en production
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
