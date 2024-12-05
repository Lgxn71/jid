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
          UserOrganization: {
            some: {
              userId: user.id,
              organizationId: params.id
            }
          }
        }
      ]
    }
  });

  console.log(currentOrg);

  if (!currentOrg) {
    throw new Error('Organization not found');
  }

  const currentOrgUsers = await prisma.organization.findUnique({
    where: {
      id: currentOrg.id
    },
    select: {
      UserOrganization: {
        where: {
          organizationId: currentOrg.id
        },
        select: {
          role: true,
          user: {
            select: {
              email: true,
              lastName: true,
              firstName: true,
              imageUrl: true,
              id: true
            }
          }
        }
      }
    }
  });

  return json(stringify(currentOrgUsers?.UserOrganization));
};
