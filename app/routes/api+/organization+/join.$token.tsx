import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';

export async function action({ request, params }: ActionFunctionArgs) {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw new Error('Unauthenticated!');
  }

  const { token } = params;

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Find and validate the invitation
    const invitation = await prisma.invitationLink.findUnique({
      where: { token }
    });

    if (!invitation) {
      return json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    if (invitation.isUsed) {
      return json(
        { error: 'Invitation has already been used' },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return json({ error: 'Invitation has expired' }, { status: 400 });
    }

    if (invitation.email && invitation.email !== user.email) {
      return json(
        { error: 'This invitation was meant for a different email address' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId
        }
      }
    });

    if (existingMembership) {
      return json(
        { error: 'You are already a member of this organization' },
        { status: 400 }
      );
    }

    // Add user to organization and mark invitation as used
    await prisma.$transaction([
      prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role
        }
      }),
      prisma.invitationLink.update({
        where: { id: invitation.id },
        data: { isUsed: true }
      })
    ]);

    return json({ success: true });
  } catch (error) {
    console.error('Error joining organization:', error);
    return json({ error: 'Failed to join organization' }, { status: 500 });
  }
}
