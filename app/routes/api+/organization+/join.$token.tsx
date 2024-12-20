import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { authenticator, isLoggedIn } from '~/routes/auth+/server.server';

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
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find and validate the invitation with organization details
      const invitation = await tx.invitationLink.findUnique({
        where: { token },
        include: {
          organization: true
        }
      });

      if (!invitation) {
        throw new Error('Invalid invitation token');
      }

      if (!invitation.organization) {
        throw new Error('Organization no longer exists');
      }

      if (invitation.isUsed) {
        throw new Error('Invitation has already been used');
      }

      if (invitation.expiresAt < new Date()) {
        await tx.invitationLink.delete({
          where: { id: invitation.id }
        });
        throw new Error('Invitation has expired');
      }

      if (invitation.email && invitation.email !== user.email) {
        throw new Error('This invitation was meant for a different email address');
      }

      // Check if user is already a member with lock
      const existingMembership = await tx.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: invitation.organizationId
          }
        }
      });

      if (existingMembership) {
        throw new Error('You are already a member of this organization');
      }

      // Create membership and mark invitation as used
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role
        }
      });

      await tx.invitationLink.update({
        where: { id: invitation.id },
        data: { isUsed: true }
      });

      // Create default Y.js tables for the user
      await tx.ydocOperations.create({
        data: {
          room: invitation.organizationId,
          op: Buffer.from('')
        }
      });

      await tx.ydocAwareness.create({
        data: {
          clientId: user.id,
          room: invitation.organizationId,
          op: Buffer.from(''),
          updated: new Date()
        }
      });

      return { success: true };
    });

    return json(result);
  } catch (error) {
    console.error('Error joining organization:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to join organization' },
      { status: 400 }
    );
  }
}
