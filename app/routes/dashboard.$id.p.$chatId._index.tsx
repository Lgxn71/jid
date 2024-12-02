import { useContext, useEffect, useRef, useState } from 'react';

import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserContext } from '~/context/userContext';
import { generateHTML } from '@tiptap/html'
import TipTap, { extensions } from '~/components/ui/rich-text/tiptap';
import { ActionFunctionArgs } from '@remix-run/node';
import { authenticator, isLoggedIn } from '~/auth.server';
import { useShape } from '@electric-sql/react';
import { useFetcher, useParams } from '@remix-run/react';
import { Message } from '@prisma/client';
import { prisma } from '~/db.server';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  differenceInMinutes,
  format,
  formatDistanceToNow,
  isSameDay,
  isToday,
  isYesterday
} from 'date-fns';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '~/lib/utils';
import { AnyExtension } from '@tiptap/core';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const formData = await request.formData();
  const user = await authenticator.isAuthenticated(request);

  const formDataObj = Object.fromEntries(formData);

  if (request.method === 'POST') {
    await prisma.message.create({
      data: {
        content: formDataObj.content as string,
        senderId: user?.id!,
        projectId: params.chatId!
      }
    });
  }

  return null;
};

export default function ChatPage() {
  const user = useContext(UserContext);
  const params = useParams();
  const fetcher = useFetcher();
  const queryClient = useQueryClient();

  const { data: messages } = useShape({
    url: 'http://192.168.200.192:3000/v1/shape',
    table: '"Message"',
    where: `"projectId"='${params.chatId}'`
  }) as { data: Message[] };

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const textSchema = z.object({
    description: z.string().min(1),
    createdAt: z.number().default(Date.now())
  });

  const form = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    mode: 'onChange',
    defaultValues: {
      description: '{}'
    }
  })
  console.log(form.getValues().description)

  useEffect(() => {
    messageContainerRef.current?.scrollTo({
      top: messageContainerRef.current.scrollHeight
    });
  }, [messages]);

  const onSubmit = form.handleSubmit((values: z.infer<typeof textSchema>) => {
    fetcher.submit(
      {
        content: values.description
      },
      {
        method: 'POST'
      }
    );
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    form.reset({
      description: '{}'
    });
  });

  return (
    <>
      <main className="max-h-full h-full relative flex flex-col flex-nowrap">
        <div
          className="h-full rounded-lg flex w-full flex-col overflow-auto shrink"
          ref={messageContainerRef}
        >
          {messages.map((message, index) => {
            const messageDate = new Date(message.createdAt);
            const prevMessageDate =
              index > 0
                ? new Date(messages?.[index - 1]?.createdAt ?? '')
                : null;
            const isFirstMessageFromUser =
              index === 0 ||
              messages?.[index - 1]?.senderId !== message.senderId;
            const shouldDisplayDate =
              index === 0 || !isSameDay(messageDate, prevMessageDate!);
            const isNewGroup =
              shouldDisplayDate ||
              isFirstMessageFromUser ||
              differenceInMinutes(messageDate, prevMessageDate!) > 5;

            return (
              <React.Fragment key={message.id}>
                {shouldDisplayDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-card px-2 py-1 rounded-full shadow-sm border border-border">
                      {isToday(messageDate)
                        ? 'Today'
                        : isYesterday(messageDate)
                        ? 'Yesterday'
                        : format(messageDate, 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}
                <div className="hover:bg-black/5 dark:hover:bg-white/5 rounded-lg duration-200 group">
                  <div
                    className={`flex items-start ${
                      isNewGroup ? 'mt-4' : 'mt-1 ml-2'
                    }`}
                  >
                    {isNewGroup && (
                      <Avatar className="ml-4 size-8 flex-shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.senderId}`}
                        />
                        <AvatarFallback>
                          {message.senderId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      {isNewGroup && (
                        <div className="flex items-baseline mb-1 ml-4">
                          <span className="font-bold mr-2">
                            {message.senderId}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(messageDate, 'h:mm a')}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn('flex items-start', {
                          'ml-3': isNewGroup
                        })}
                      >
                        {!isNewGroup && (
                          <span className="text-[10px] mr-2 text-gray-400 ml-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2">
                            {format(messageDate, 'h:mm a')}
                          </span>
                        )}
                        <div
                          className="prose text-sm max-w-none rounded py-0.5 px-1 transition-colors duration-200"
                          dangerouslySetInnerHTML={{
                            __html: generateHTML(JSON.parse(message.content ?? ''), extensions as AnyExtension[])
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className='w-[calc(100vw_-_19.25rem)]'>
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
      </main>
    </>
  );
}
