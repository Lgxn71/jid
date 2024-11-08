import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export async function loader() {
  return redirect('/login');
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return await authenticator.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login?failed=true'
  });
}
