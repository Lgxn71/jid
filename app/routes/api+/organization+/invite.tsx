import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';

const generateInviteSchema = z.object({
  organizationId: z.string(),
  email: z.string().email().optional(),
  role: z.enum(['Admin', 'Member', 'Viewer'])
});

export async function action({ request }: ActionFunctionArgs) {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw new Error('Unauthenticated!');
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = generateInviteSchema.parse(await request.json());

    // Check if user has permission to invite (is owner or admin)
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: data.organizationId,
        role: { in: ['Admin', 'Owner'] }
      }
    });

    if (!userOrg) {
      return json(
        { error: 'You do not have permission to invite users' },
        { status: 403 }
      );
    }

    // Create invitation link
    const invitation = await prisma.invitationLink.create({
      data: {
        token: uuidv4(),
        organizationId: data.organizationId,
        creatorId: user.id,
        role: data.role,
        email: data.email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return json({ token: invitation.token });
  } catch (error) {
    console.error('Error generating invite:', error);
    return json({ error: 'Failed to generate invite' }, { status: 500 });
  }
}
