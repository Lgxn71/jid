import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';
import { prisma } from '~/db.server';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const formData = await request.formData();

  const user = await authenticator.isAuthenticated(request);

  const formDataObj = Object.fromEntries(formData);

  if (formDataObj.intent === 'CREATE_PROJECT' && formDataObj.name && user) {
    const newOrg = await prisma.project.create({
      data: {
        organization: {
          connect: {
            id: params.id
          }
        },
        members: {
          connect: {
            id: user.id
          }
        },
        name: formDataObj.name.toString()
      }
    });

    return null;
  }
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {};
