import { createContext } from 'react';
import type { Message } from '@prisma/client';
import { useShape } from '@electric-sql/react';

export const Messages = createContext<Message[]>([]);

export const MessagesProvider = Messages.Provider;
