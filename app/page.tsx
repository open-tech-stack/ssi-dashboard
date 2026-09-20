// app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ssi.accessToken')?.value;

  redirect(token ? '/dashboard' : '/login');
}