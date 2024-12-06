import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider
} from '~/components/roadmap-ui/kanban';
import type { DragEndEvent } from '@dnd-kit/core';
import { format } from 'date-fns';
import { useMemo } from 'react';
import type { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ClientOnly } from 'remix-utils/client-only';
import { z } from 'zod';
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  useParams
} from '@remix-run/react';
import { getShapeStream, preloadShape, useShape } from '@electric-sql/react';
import { Status, Task, User } from '@prisma/client';
import { matchStream } from '~/lib/match-stream';
import { ActionFunctionArgs } from '@remix-run/node';
import { authenticator, isLoggedIn } from './auth+/server';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '~/components/ui/badge';

const textSchema = z.object({
  description: z.string().min(1),
  createdAt: z.number().default(Date.now()),
  uuid: z
    .string()
    .uuid()
    .default(() => uuidv4())
});

const taskShape = (params: Record<string, string | undefined>) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"Task"',
      where: `ARRAY["projectId"]::text[] <@ ARRAY['${params.chatId}']::text[]`
    }
  };
};

const statusShape = (params: Record<string, string | undefined>) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"Status"',
      where: `ARRAY["projectId"]::text[] <@ ARRAY['${params.chatId}']::text[]`
    }
  };
};

const userTaskShape = (userIds: string[]) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"_UserTasks"',
      where: `ARRAY["B"]::text[] <@ ARRAY['${userIds}']::text[]`
    }
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  return await preloadShape(taskShape(params));
};

export const clientAction = async ({
  request,
  params
}: ClientActionFunctionArgs) => {
  const body = await request.formData();

  const uuid = body.get('uuid');

  const itemsStream = getShapeStream<Pick<Task, 'id'>>(taskShape(params));

  // Match the insert
  const findUpdatePromise = matchStream({
    stream: itemsStream,
    operations: [`insert`],
    matchFn: ({ message }) => {
      return message.value.id === uuid;
    }
  });

  // Generate new UUID and post to backend
  const fetchPromise = fetch(`/api/project/${params.chatId}/message`, {
    method: `POST`,
    body: JSON.stringify({
      uuid: body.get(`uuid`),
      content: body.get('content')
    }),
    credentials: 'include'
  });

  return await Promise.all([findUpdatePromise, fetchPromise]);
};

export const KanbanExample: FC = () => {
  const params = useParams();
  const { data: users } = useQuery<
    {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string | null;
        imageUrl: string | null;
      };
      role: string;
    }[]
  >({
    queryKey: [`org_${params.id}_users`]
  });
  const { data: tasks } = useShape(taskShape(params)) as { data: Task[] };
  const { data: statuses } = useShape(statusShape(params)) as {
    data: Status[];
  };

  const { data: userTasks } = useShape(
    userTaskShape(users?.map(user => user.user.id) ?? [])
  ) as {
    data: { A: string; B: string }[];
  };

  const features = useMemo(() => {
    return tasks.map(task => {
      const status = statuses.find(status => status.id === task.statusId);
      const assignees = userTasks
        .filter(userTask => {
          console.log(userTask);
          return userTask.A === task.id;
        })
        .reduce(
          (acc, userTask) => {
            const user = users?.find(user => user.user.id === userTask.B);
            if (user) acc.push(user); // Ensure you don't push undefined values
            return acc; // Always return the accumulator
          },
          [] as {
            user: {
              id: string;
              email: string;
              firstName: string;
              lastName: string | null;
              imageUrl: string | null;
            };
            role: string;
          }[]
        );

      return {
        ...task,
        status,
        assignees
      };
    });
  }, [tasks, users, userTasks, statuses]);

  console.log(features);

  // const [features, setFeatures] = useState(exampleFeatures);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const status = statuses
      .map(status => ({ ...status, color: 'green' }))
      .find(status => status.status === over.id);

    if (!status) {
      return;
    }

    // setFeatures(
    //   features.map(feature => {
    //     if (feature.id === active.id) {
    //       return { ...feature, status };
    //     }

    //     return feature;
    //   })
    // );
  };

  return (
    <KanbanProvider onDragEnd={handleDragEnd}>
      {statuses.map(status => (
        <KanbanBoard key={status.status} id={status.status}>
          <KanbanHeader name={status.status} color={'green'} />
          <KanbanCards>
            {features
              .filter(feature => feature?.status?.status === status.status)
              .map((feature, index) => (
                <KanbanCard
                  key={feature.id}
                  id={feature.id}
                  name={feature.name}
                  parent={status.status}
                  index={index}
                  onClick={() => console.log('Feature clicked')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex-1 font-medium text-sm">
                        {feature.name}
                      </p>
                      <p className="m-0 text-xs text-muted-foreground line-clamp-2">
                        {feature.description ?? <em>Empty Description</em>}
                      </p>
                    </div>
                    {feature.assignees[0] && (
                      <Avatar className="h-4 w-4 shrink-0">
                        <AvatarImage
                          src={feature.assignees[0].user.imageUrl ?? ''}
                        />
                        <AvatarFallback>
                          {feature.assignees[0].user.firstName?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <p className="m-0 text-xs text-muted-foreground mt-2">
                    {feature?.startAt
                      ? format(
                          new Date(feature?.startAt as unknown as string),
                          'MMM d'
                        )
                      : <em>No start date</em>}{' '}
                    -{' '}
                    {feature?.startAt
                      ? format(
                          new Date(feature?.description as unknown as string),
                          'MMM d, yyyy'
                        )
                      : <em>No end date</em>}
                  </p>
                  <Badge className='mt-2 text-xs'>Priority: {feature.priority}</Badge>
                </KanbanCard>
              ))}
          </KanbanCards>
        </KanbanBoard>
      ))}
    </KanbanProvider>
  );
};

export default function KanbanPage() {
  return <ClientOnly>{() => <KanbanExample />}</ClientOnly>;
}
