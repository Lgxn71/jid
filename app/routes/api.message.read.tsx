import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';

export const action = async ({ request }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);
  
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { messageId } = await request.json();

  const message = await prisma.message.update({
    where: { id: messageId },
    data: {
      readByUserIds: {
        push: user?.id
      }
    }
  });

  return json({ message });
}; 