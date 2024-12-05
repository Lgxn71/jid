import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { exampleStatuses } from '~/lib/content';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider
} from '~/components/roadmap-ui/kanban';
import type { DragEndEvent } from '@dnd-kit/core';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { exampleFeatures } from '~/lib/content';
import { v4 as uuidv4 } from 'uuid';

// Import Yjs and y-websocket
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ClientOnly } from 'remix-utils/client-only';
import { z } from 'zod';
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs
} from '@remix-run/react';
import { getShapeStream, preloadShape } from '@electric-sql/react';
import { Task } from '@prisma/client';
import { matchStream } from '~/lib/match-stream';
import { ActionFunctionArgs } from '@remix-run/node';
import { authenticator, isLoggedIn } from './auth+/server';

const textSchema = z.object({
  description: z.string().min(1),
  createdAt: z.number().default(Date.now()),
  uuid: z
    .string()
    .uuid()
    .default(() => uuidv4())
});

const itemShape = (params: Record<string, string | undefined>) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"Task"',
      where: `ARRAY["projectId"]::text[] <@ ARRAY['${params.chatId}']::text[]`
    }
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  return await preloadShape(itemShape(params));
};

export const clientAction = async ({
  request,
  params
}: ClientActionFunctionArgs) => {
  const body = await request.formData();

  const uuid = body.get('uuid');

  const itemsStream = getShapeStream<Pick<Task, 'id'>>(itemShape(params));

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
  // Initialize Yjs document and provider
  const [doc] = useState(() => new Y.Doc());
  const [provider] = useState(
    () => new WebsocketProvider('wss://websocket.localhost', 'kanban-room', doc)
  );

  const [features, setFeatures] = useState(exampleFeatures);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const status = exampleStatuses.find(status => status.name === over.id);

    if (!status) {
      return;
    }

    setFeatures(
      features.map(feature => {
        if (feature.id === active.id) {
          return { ...feature, status };
        }

        return feature;
      })
    );
  };

  return (
    <KanbanProvider onDragEnd={handleDragEnd}>
      {exampleStatuses.map(status => (
        <KanbanBoard key={status.name} id={status.name}>
          <KanbanHeader name={status.name} color={status.color} />
          <KanbanCards>
            {features
              .filter(feature => feature?.status?.name === status.name)
              .map((feature, index) => (
                <KanbanCard
                  key={feature.id}
                  id={feature.id}
                  name={feature.name}
                  parent={status.name}
                  index={index}
                  onClick={() => console.log('Feature clicked')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex-1 font-medium text-sm">
                        {feature.name}
                      </p>
                      <p className="m-0 text-xs text-muted-foreground">
                        {feature.initiative?.name}
                      </p>
                    </div>
                    {feature.owner && (
                      <Avatar className="h-4 w-4 shrink-0">
                        <AvatarImage src={feature.owner.image} />
                        <AvatarFallback>
                          {feature.owner.name?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <p className="m-0 text-xs text-muted-foreground">
                    {/* {format(new Date(feature.startAt), 'MMM d')} -{' '}
                    {format(new Date(feature.endAt), 'MMM d, yyyy')} */}
                  </p>
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
