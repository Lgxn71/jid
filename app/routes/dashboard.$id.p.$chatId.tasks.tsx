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

// Import Yjs and y-websocket
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ClientOnly } from 'remix-utils/client-only';

export const KanbanExample: FC = () => {
  // Initialize Yjs document and provider
  const [doc] = useState(() => new Y.Doc());
  const [provider] = useState(
    () => new WebsocketProvider('ws://192.168.200.187:1234', 'kanban-room', doc)
  );

  // Get a shared Y.Array for features
  const yFeatures = doc.getArray('features');

  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    // Initialize features from Yjs or set default if empty
    if (yFeatures.length === 0) {
      yFeatures.push(exampleFeatures);
    } else {
      setFeatures(yFeatures.toArray());
    }

    // Observe changes in the shared features array
    const handleChanges = () => {
      setFeatures(yFeatures.toArray());
    };
    yFeatures.observeDeep(handleChanges);

    return () => {
      yFeatures.unobserveDeep(handleChanges);
      provider.disconnect();
      doc.destroy();
    };
  }, [yFeatures, provider]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const status = exampleStatuses.find(s => s.name === over.id);

    if (!status) {
      return;
    }

    // Update the feature's status in the shared Yjs array
    const index = yFeatures.toArray().findIndex((f: any) => f.id === active.id);
    if (index !== -1) {
      yFeatures.get(index).status = status;
      yFeatures.doc?.transact(() => {
        yFeatures.delete(index, 1);
        yFeatures.insert(index, [yFeatures.get(index)]);
      });
    }
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
