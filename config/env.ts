// config/env.ts

/**
 * Configuration d'environnement côté Next.js.
 *
 * NEXT_PUBLIC_* est accessible côté serveur et côté navigateur.
 */
export const ENV = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? 'https://ssi-backend-two.vercel.app/api',
} as const;