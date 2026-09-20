// types/auth.types.ts

/**
 * Rôles possibles.
 */
export type UserRole = 'ADMIN' | 'MEMBRE';

/**
 * Utilisateur tel que renvoyé par l'API.
 *
 * ⚠️ Le `code` n'est JAMAIS inclus dans les réponses d'authentification.
 *    Il n'apparaît que dans les endpoints admin /users/*.
 *
 * Le rôle est déjà filtré côté back (login refuse les non-ADMIN),
 * donc côté dashboard on est toujours ADMIN.
 */
export interface AuthUser {
  id: string;
  role: UserRole;
  personId: string | null;
  fullName: string | null;
}

/**
 * Réponse du login web : uniquement l'utilisateur.
 * Les tokens sont dans les cookies httpOnly (invisibles en JS).
 */
export interface LoginResponse {
  user: AuthUser;
}

/**
 * Payload envoyé pour le login.
 */
export interface LoginRequest {
  code: string;
}

/**
 * Réponse de /auth/me.
 * Identique à AuthUser (même forme).
 */
export type MeResponse = AuthUser;