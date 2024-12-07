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

  if (!currentOrg) {
    throw new Error('Organization not found');
  }

  const orgs = await prisma.organization.findMany({
    where: {
      UserOrganization: {
        some: {
          userId: user.id
        }
      }
    }
  });

  const projects = await prisma.project.findMany({
    where: {
      organizationId: currentOrg.id,
      members: {
        some: {
          id: user.id
        }
      }
    }
  });

  return json({
    orgs: stringify(orgs),
    projects: stringify(projects)
  });
};
