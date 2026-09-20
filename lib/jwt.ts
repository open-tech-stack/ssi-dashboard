// utils/jwt.ts
/**
 * Helpers JWT côté client / middleware.
 *
 * ⚠️ IMPORTANT : on ne fait PAS de vérification de signature ici.
 * La signature ne peut être vérifiée que côté backend, avec la clé secrète.
 * On décode uniquement pour lire l'expiration (`exp`) et éviter les
 * redirections inutiles et les flashs d'UI.
 */

export interface JwtPayload {
  exp?: number; // expiration (secondes epoch)
  iat?: number; // issued at
  sub?: string; // subject (user id)
  role?: string;
  [key: string]: unknown;
}

/**
 * Décode le payload d'un JWT (partie 2) sans vérifier la signature.
 * @returns payload ou null si invalide
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Padding base64 si nécessaire
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    // Décodage compatible Edge & navigateur
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Vérifie si un JWT est expiré.
 * @param leewaySec marge de sécurité pour les décalages d'horloge
 */
export function isJwtExpired(token: string, leewaySec = 5): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + leewaySec;
}

/**
 * Retourne le timestamp d'expiration en ms, ou null.
 * Utile pour programmer un refresh proactif.
 */
export function getJwtExpiresAt(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}