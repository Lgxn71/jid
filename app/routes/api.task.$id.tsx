import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (request.method === 'PATCH') {
    const updates = await request.json();

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updates,
      include: {
        assignees: true,
        status: true
      }
    });

    return json({ task });
  }

  return json({ error: 'Method not supported' }, { status: 405 });
}; 