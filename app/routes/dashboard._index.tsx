import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticator, isOnboarded } from '~/routes/auth+/server';
import { prisma } from '~/db.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await isOnboarded(request, {
    hasOrg: true
  });

  const user = (await authenticator.isAuthenticated(request))!;

  const org = await prisma.userOrganization.findFirst({
    where: {
      userId: user.id
    }
  });

  if (!org) {
    return redirect('/organization');
  }

  return redirect(`/dashboard/${org.organizationId}`);
};
