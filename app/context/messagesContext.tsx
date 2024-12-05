import { createContext, ReactNode } from 'react';
import type { Message } from '@prisma/client';
import { useShape } from '@electric-sql/react';

export const Messages = createContext<Message[]>([]);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  return <Messages.Provider value={[]}>{children}</Messages.Provider>;
};
