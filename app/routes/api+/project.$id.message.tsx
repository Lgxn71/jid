import { ActionFunctionArgs } from '@remix-run/node';
import { authenticator, isLoggedIn } from '../auth+/server';
import { prisma } from '~/db.server';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  console.log('s');
  await isLoggedIn(request);
  const formData = await request.json();
  const user = await authenticator.isAuthenticated(request);

  console.log(user);

  if (request.method === 'POST') {
    const msg = await prisma.message.create({
      data: {
        content: formData.content as string,
        id: formData.uuid as string,
        project: {
          connect: {
            id: params.id!
          }
        },
        sender: {
          connect: {
            id: user?.id!
          }
        }
      }
    });

    return msg.id;
  }

  return null;
};
