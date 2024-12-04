import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';
import { prisma } from '~/db.server';
import { stringify } from 'superjson';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw new Error('User not authenticated');
  }

  const currentOrg = await prisma.organization.findFirst({
    where: {
      AND: [
        {
          id: params.id
        },
        {
          members: {
            some: {
              id: user.id
            }
          }
        }
      ]
    }
  });

  if (!currentOrg) {
    throw new Error('Organization not found');
  }

  const currentOrgUsers = await prisma.organization.findUnique({
    where: {
      id: currentOrg.id
    },
    select: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          email: true
        }
      }
    }
  });

  return json(stringify(currentOrgUsers?.members));
};
