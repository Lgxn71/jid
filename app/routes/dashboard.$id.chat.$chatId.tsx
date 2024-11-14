import React, { useContext, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { useSocket } from '~/context/socketContext';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TipTap from '~/components/ui/rich-text/tiptap';
import { UserContext } from '~/context/userContext';
import { cn } from '~/lib/utils';
import DOMPurify from 'dompurify';

export default function ChatPage() {
  const socket = useSocket();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<
    {
      userName: string;
      userId: string;
      message: string;
      createdAt: number;
    }[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat', (data: (typeof messages)[0]) => {
      setMessages(state => [
        ...state,
        {
          userName: data.userName,
          message: data.message,
          userId: data.userId,
          createdAt: data.createdAt
        }
      ]);
    });
  }, [socket]);

  const textSchema = z.object({
    description: z.string().min(1).max(500),
    createdAt: z.number().default(Date.now())
  });

  const form = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    mode: 'onChange',
    defaultValues: {
      description: ''
    }
  });

  const onSubmit = form.handleSubmit((values: z.infer<typeof textSchema>) => {
    socket?.emit('chat', {
      userName: user?.firstName,
      message: values.description,
      userId: user?.id!,
      createdAt: Date.now()
    });

    setMessages(state => [
      ...state,
      {
        userName: user?.firstName!,
        message: values.description,
        userId: user?.id!,
        createdAt: Date.now()
      }
    ]);

    form.reset({
      description: ''
    });
  });

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="absolute bottom-2 w-[calc(100%_-_16px)]"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TipTap
                    onSubmit={onSubmit}
                    onChange={field.onChange}
                    description={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="rounded-lg flex pb-2 w-full h-full flex-col overflow-scroll flex-1">
        {messages.map(message => (
          <div
            key={message.createdAt}
            className={cn('p-5 hover:bg-secondary rounded w-full duration-150')}
          >
            <span>{message.userName}</span>
            <p
              dangerouslySetInnerHTML={{
                __html: message.message
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
