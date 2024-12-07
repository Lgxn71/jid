import { createContext, ReactNode, useCallback, useContext } from 'react';
import type { Message, Project } from '@prisma/client';
import { getShapeStream, useShape } from '@electric-sql/react';
import { useParams } from '@remix-run/react';
import { messagesShape } from '~/lib/shapes/message';
import { matchStream } from '~/lib/match-stream';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { useQuery } from '@tanstack/react-query';

export const messageSchema = z.object({
  content: z.string().min(1),
  uuid: z
    .string()
    .uuid()
    .default(() => uuidv4())
});

export const MessageContext = createContext<{
  messages: Message[];
  submitMessage: ({ uuid, content }: z.infer<typeof messageSchema>) => void;
}>({
  messages: [],
  submitMessage() {}
});

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects']
  });

  const submitMessage = useCallback(
    async ({ uuid, content }: z.infer<typeof messageSchema>) => {
      const itemsStream = getShapeStream<Pick<Message, 'id'>>(
        messagesShape([params.chatId ?? ""])
      );

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
          uuid,
          content
        }),
        credentials: 'include'
      });

      return await Promise.all([findUpdatePromise, fetchPromise]);
    },
    [params.chatId]
  );

  const { data } = useShape(
    messagesShape(projects?.map(project => project.id) ?? [])
  ) as {
    data: Message[];
  };

  return (
    <MessageContext.Provider
      value={{
        messages: data,
        submitMessage
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);
