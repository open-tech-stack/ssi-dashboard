// app/page.tsx
import { redirect } from 'next/navigation';

/**
 * Route racine `/`.
 *
 * Aiguillage simple : on renvoie toujours vers /login.
 * Si l'utilisateur est déjà connecté (cookies httpOnly valides),
 * le proxy Edge le redirigera automatiquement vers /dashboard.
 *
 * Avantage : plus de logique de cookie ici, une seule source
 * de vérité (le proxy).
 */
export default function Home() {
  redirect('/login');
}