import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';
import { prisma } from '~/db.server';
import { createDefaultStatuses } from '~/lib/defaults.server';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const formData = await request.formData();
  const user = await authenticator.isAuthenticated(request);

  const formDataObj = Object.fromEntries(formData);

  if (formDataObj.intent === 'CREATE_PROJECT' && formDataObj.name && user) {
    const newProject = await prisma.project.create({
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

    // Create default statuses for the new project
    await createDefaultStatuses(newProject.id);

    return json({ project: newProject });
  }

  throw new Error('Invalid request');
};
