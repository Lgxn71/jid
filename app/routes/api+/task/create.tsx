import { ActionFunctionArgs, json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { z } from 'zod';
import { authenticator, isLoggedIn } from '~/routes/auth+/server';

const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  projectId: z.string(),
  statusId: z.string(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium')
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
    const data = createTaskSchema.parse(await request.json());

    // Verify user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        members: {
          some: {
            id: user.id
          }
        }
      }
    });

    if (!project) {
      return json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Verify status belongs to the project
    const status = await prisma.status.findFirst({
      where: {
        id: data.statusId,
        projectId: data.projectId
      }
    });

    if (!status) {
      return json(
        { error: 'Invalid status for this project' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        statusId: data.statusId,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignees: data.assigneeIds ? {
          connect: data.assigneeIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        assignees: true,
        status: true
      }
    });

    return json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
} 