// next.config.ts
import type { NextConfig } from 'next';

const BACKEND_URL =
  process.env.BACKEND_URL ?? 'https://ssi-backend-two.vercel.app';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Toute requête vers /api/* est relayée vers le backend
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;