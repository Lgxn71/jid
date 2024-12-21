// app/services/auth.server.ts
import { Authenticator } from 'remix-auth';
import { sessionStorage } from '~/sessions.server';
import { GitHubStrategy } from 'remix-auth-github';
import { prisma } from '../../db.server';
import type { User } from '@prisma/client';
import { redirect } from '@remix-run/node';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: 'my-error-key'
});

const gitHubStrategy = new GitHubStrategy(
  {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectURI: process.env.GITHUB_REDIRECT_URI!
  },
  async ({ profile, tokens, request, context }) => {
    const newOrExisingAccount = await prisma.user.upsert({
      where: {
        email: profile.emails[0]?.value!
      },
      update: {},
      create: {
        email: profile.emails[0]?.value!,
        authProvider: 'github',
        firstName: profile.displayName,
        providerId: profile.id,
        imageUrl: profile.photos[0]?.value
      }
    });

    return newOrExisingAccount;
  }
);

authenticator.use(gitHubStrategy);

export const isLoggedIn = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw redirect('/login');
  }
};

export const isOnboarded = async (
  request: Request,
  options?: { hasOrg?: boolean }
) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (!user?.isOnboarded) {
    throw redirect('/onboarding');
  }

  if (options?.hasOrg) {
    const org = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!org) {
      throw redirect('/organization');
    }
  }
};
