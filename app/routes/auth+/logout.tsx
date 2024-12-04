import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/routes/auth+/server';

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.logout(request, { redirectTo: '/login' });
}
