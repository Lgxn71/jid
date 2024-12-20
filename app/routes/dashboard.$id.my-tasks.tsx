import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { prisma } from '~/db.server';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { format } from 'date-fns';
import { TaskModal } from '~/components/task-modal';
import { authenticator, isLoggedIn } from './auth+/server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  const tasks = await prisma.task.findMany({
    where: {
      assignees: {
        some: {
          id: user.id
        }
      },
      project: {
        organizationId: params.id
      }
    },
    include: {
      assignees: true,
      status: true,
      project: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const statuses = await prisma.status.findMany({
    where: {
      project: {
        organizationId: params.id
      }
    }
  });

  return json({ tasks, statuses });
}

export default function MyTasksPage() {
  const { tasks, statuses } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

      <div className="space-y-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{task.name}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>

                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {task.project.name}
                  </Badge>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: task.status.id + '20',
                      color: task.status.id
                    }}
                  >
                    {task.status.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority: {task.priority}
                  </Badge>
                </div>
              </div>

              <div className="flex -space-x-2">
                {task.assignees.map(assignee => (
                  <Avatar
                    key={assignee.id}
                    className="h-8 w-8 border-2 border-white"
                  >
                    <AvatarImage src={assignee.imageUrl ?? ''} />
                    <AvatarFallback>
                      {assignee.firstName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>
                Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </span>
              {task.dueDate && (
                <span>
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No tasks assigned to you
          </div>
        )}
      </div>

      <TaskModal statuses={statuses} />
    </div>
  );
}
