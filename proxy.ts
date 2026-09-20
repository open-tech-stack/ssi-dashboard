// proxy.ts
/**
 * proxy Next.js — protège /dashboard, /users, etc.
 *
 * Règles :
 *  - Non authentifié + route protégée → redirige vers /login (avec ?from=)
 *  - Authentifié + sur /login        → redirige vers /dashboard
 *  - Route publique : /login uniquement
 *
 * ⚠️ Ce proxy gère l'UX (éviter le flash du dashboard).
 *    La sécurité réelle (vérification de la signature JWT) est
 *    déléguée au backend, qui valide chaque requête API.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isJwtExpired } from './lib/jwt';


const PUBLIC_ROUTES = ['/login'];
const DEFAULT_AUTH_ROUTE = '/dashboard';
const DEFAULT_PUBLIC_ROUTE = '/login';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ------------------------------------------------------------------
  // 1. Lecture des cookies d'auth
  // ------------------------------------------------------------------
  const accessToken = request.cookies.get('ssi.accessToken')?.value;
  const refreshToken = request.cookies.get('ssi.refreshToken')?.value;

  // Access token utilisable = présent ET non expiré
  const hasValidAccess =
    Boolean(accessToken) && !isJwtExpired(accessToken!);

  // Refresh présent = on peut potentiellement renouveler l'access
  // (le refresh silencieux sera fait par http.service au premier appel API)
  const hasRefresh = Boolean(refreshToken);

  // Authentifié si l'access est valide OU si on a de quoi le renouveler
  const isAuthenticated = hasValidAccess || hasRefresh;

  // ------------------------------------------------------------------
  // 2. Détermine si la route est publique
  // ------------------------------------------------------------------
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // ------------------------------------------------------------------
  // 3. Non authentifié + route protégée → /login
  // ------------------------------------------------------------------
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_PUBLIC_ROUTE;
    url.search = '';

    // Mémorise la route voulue pour y revenir après connexion
    // (exclut "/" qui est juste un aiguillage)
    if (pathname !== '/' && pathname !== DEFAULT_PUBLIC_ROUTE) {
      url.searchParams.set('from', pathname);
    }

    return NextResponse.redirect(url);
  }

  // ------------------------------------------------------------------
  // 4. Authentifié + route publique → /dashboard
  // ------------------------------------------------------------------
  if (isAuthenticated && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTH_ROUTE;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // ------------------------------------------------------------------
  // 5. Sinon : on laisse passer
  // ------------------------------------------------------------------
  return NextResponse.next();
}

export const config = {
  /**
   * Match toutes les routes SAUF :
   *  - /_next/static  → assets de build
   *  - /_next/image   → optimisation d'images
   *  - /favicon.ico   → favicon
   *  - /robots.txt    → SEO
   *  - /sitemap.xml   → SEO
   *  - tout fichier avec une extension (images, css, js, fonts, …)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};