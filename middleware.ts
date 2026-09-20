// middleware.ts
/**
 * Middleware Next.js — protège les routes /dashboard, /users, etc.
 *
 * Règles :
 *  - Non authentifié + route protégée → redirige vers /login
 *  - Authentifié + sur /login → redirige vers /dashboard
 *  - Route publique : /login uniquement
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];
const DEFAULT_AUTH_ROUTE = '/dashboard';
const DEFAULT_PUBLIC_ROUTE = '/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lit le cookie d'access token
  const token = request.cookies.get('ssi.accessToken')?.value;
  const userRaw = request.cookies.get('ssi.user')?.value;

  const isAuthenticated = !!token && !!userRaw;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // 1) Non authentifié + route protégée → login
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_PUBLIC_ROUTE;
    return NextResponse.redirect(url);
  }

  // 2) Authentifié + sur /login → dashboard
  if (isAuthenticated && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTH_ROUTE;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Applique le middleware à toutes les routes SAUF :
   *  - /_next (assets Next.js)
   *  - /api (routes API Next.js)
   *  - fichiers statiques (favicon, images…)
   */
  matcher: ['/((?!_next|api|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};