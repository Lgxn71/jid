import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth } from '~/auth';

export default async function Home() {
  const session = await auth();

  return (
    <>
      <h1>Welcome!</h1>
      <p>
        {!session?.user
          ? 'You are not logged in!'
          : `Hello, ${session.user.name}`}
      </p>
      {!session?.user ? (
        <Button asChild>
          <Link href="/auth">Sign In</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href="/api/auth/signout">Sign Out</Link>
        </Button>
      )}
    </>
  );
}
