// config/env.ts

/**
 * Configuration d'environnement côté Next.js.
 *
 * NEXT_PUBLIC_* est accessible côté serveur ET côté navigateur.
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    '[config/env] NEXT_PUBLIC_API_URL est manquante. ' +
      'Vérifie ton .env.local (dev) ou les variables Vercel (prod).',
  );
}

export const ENV = {
  API_URL: apiUrl,
} as const;