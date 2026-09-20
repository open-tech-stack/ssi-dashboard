// config/env.ts
/**
 * Configuration d'environnement côté Next.js.
 * Les variables NEXT_PUBLIC_* sont exposées au client ET au serveur.
 */

export const ENV = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
} as const;