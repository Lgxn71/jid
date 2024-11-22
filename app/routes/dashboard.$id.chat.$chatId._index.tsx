import { useContext, useEffect, useRef, useState } from 'react';

import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserContext } from '~/context/userContext';

import TipTap from '~/components/ui/rich-text/tiptap';
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

  const { data: messages } = useShape({
    url: 'http://localhost:3000/v1/shape',
    table: '"Message"',
    where: `"projectId"='${params.chatId}'`
  }) as { data: Message[] };

  const messageContainerRef = useRef<HTMLDivElement>(null);

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
    form.reset({
      description: ''
    });
  });

  return (
    <>
      <main className="max-h-full h-full relative">
        <div
          className="h-full rounded-lg flex w-full flex-col overflow-auto"
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
                <div className="hover:bg-black/10 duration-200 py-2 group">
                  {shouldDisplayDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs bg-background text-gray-500 px-2 py-1 rounded-full">
                        {isToday(messageDate)
                          ? 'Today'
                          : isYesterday(messageDate)
                          ? 'Yesterday'
                          : format(messageDate, 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-start ${
                      isNewGroup ? 'mt-4' : 'mt-1 ml-2'
                    }`}
                  >
                    {isNewGroup && (
                      <Avatar className="mr-2 flex-shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.senderId}`}
                        />
                        <AvatarFallback>
                          {message.senderId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col ${isNewGroup ? '' : 'ml-10'}`}
                    >
                      {isNewGroup && (
                        <div className="flex items-baseline mb-1">
                          <span className="font-bold mr-2">
                            {message.senderId}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(messageDate, 'h:mm a')}
                          </span>
                        </div>
                      )}
                      <div
                        className="prose prose-sm max-w-none rounded p-1 transition-colors duration-200"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                        }}
                      />
                      <span className="text-xs text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {format(messageDate, 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="w-[calc(100%)]">
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
