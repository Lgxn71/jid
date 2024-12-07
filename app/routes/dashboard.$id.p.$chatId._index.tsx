import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateHTML } from '@tiptap/html';
import TipTap, { extensions } from '~/components/ui/rich-text/tiptap';
import { useShape } from '@electric-sql/react';
import { useParams } from '@remix-run/react';
import { Message, User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  differenceInMinutes,
  format,
  isSameDay,
  isToday,
  isYesterday
} from 'date-fns';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '~/lib/utils';
import { AnyExtension } from '@tiptap/core';
import { parse } from 'superjson';
import { messagesShape } from '~/lib/shapes/message';
import { messageSchema, useMessageContext } from '~/context/messagesContext';

type UserInfo = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email' | 'imageUrl'
>[];

function formatMessageTimestamp(
  currentDate: Date,
  previousDate?: Date
): string {
  if (!previousDate || !isSameDay(currentDate, previousDate)) {
    if (isToday(currentDate)) {
      return 'Today';
    } else if (isYesterday(currentDate)) {
      return 'Yesterday';
    } else {
      return format(currentDate, 'MMM d, yyyy');
    }
  }

  return format(currentDate, 'h:mm a');
}

export default function ChatPage() {
  const params = useParams();
  const { messages, submitMessage } = useMessageContext();

  const displayedMessages = useMemo(
    () => messages.filter(message => message.projectId === params.chatId),
    [messages]
  );

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
    queryKey: [`org_${params.id}_users`],
    queryFn: async () =>
      await fetch(`https://site.localhost/api/organization/${params.id}/users`)
        .then(res => res.json())
        .then(
          data =>
            parse(data) as {
              user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string | null;
                imageUrl: string | null;
              };
              role: string;
            }[]
        )
  });

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    mode: 'onChange',
    defaultValues: {
      content: '{"type":"doc","content":[]}'
    }
  });

  const onSubmit = form.handleSubmit(
    async (values: z.infer<typeof messageSchema>) => {
      await submitMessage({ ...values });

      messageContainerRef.current?.scrollTo({
        top: messageContainerRef.current.scrollHeight
      });

      form.reset({
        content: '{"type":"doc","content":[]}'
      });
    }
  );

  return (
    <>
      <main className="max-h-full h-full relative flex flex-col flex-nowrap">
        <div
          className="h-full rounded-lg flex w-full flex-col overflow-auto shrink"
          ref={messageContainerRef}
        >
          {displayedMessages.map((message, index) => {
            const messageDate = new Date(message.createdAt);
            const prevMessageDate =
              index > 0
                ? new Date(displayedMessages?.[index - 1]?.createdAt ?? '')
                : null;
            const isFirstMessageFromUser =
              index === 0 ||
              displayedMessages?.[index - 1]?.senderId !== message.senderId;
            const shouldDisplayDate =
              index === 0 || !isSameDay(messageDate, prevMessageDate!);

            const isNewGroup =
              shouldDisplayDate ||
              isFirstMessageFromUser ||
              differenceInMinutes(messageDate, prevMessageDate!) > 5;

            const sender = users?.find(
              user => user.user.id === message.senderId
            );

            return (
              <React.Fragment key={message.id}>
                {shouldDisplayDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-card px-2 py-1 rounded-full shadow-sm border border-border">
                      {formatMessageTimestamp(
                        messageDate,
                        prevMessageDate ?? undefined
                      )}
                    </span>
                  </div>
                )}
                <div
                  data-new-group={isNewGroup}
                  className="hover:bg-black/5 dark:hover:bg-white/5 rounded-lg duration-200 group data-[new-group=true]:pb-2"
                >
                  <div
                    className={`flex items-start ${
                      isNewGroup ? 'mt-2' : 'mt-1 ml-2'
                    }`}
                  >
                    {isNewGroup && (
                      <Avatar className="ml-4 size-8 flex-shrink-0">
                        <AvatarImage src={sender?.user.imageUrl ?? ''} />
                        <AvatarFallback>
                          {sender?.user.firstName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col space-y-2">
                      {isNewGroup && (
                        <div className="flex items-baseline ml-4">
                          <span className="font-bold mr-2">
                            {sender?.user.firstName}
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
                            __html: generateHTML(
                              JSON.parse(message.content ?? ''),
                              extensions as AnyExtension[]
                            )
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
          <form onSubmit={onSubmit} className="w-[calc(100vw_-_19.25rem)]">
            <FormField
              control={form.control}
              name="content"
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
