import { useParams } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';
import { AnyExtension } from '@tiptap/core';
import { generateHTML } from '@tiptap/html';
import { useContext } from 'react';
import { parse } from 'superjson';
import { extensions } from '~/components/ui/rich-text/tiptap';
import { useMessageContext } from '~/context/messagesContext';
import { UserContext } from '~/context/userContext';

export default function NotificationsRoute() {
  const params = useParams();
  const { messages } = useMessageContext();
  const user = useContext(UserContext);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="space-y-4">
        {messages
          .filter(message => !message?.readByUserIds?.includes(user.id))
          .map(message => {
            const sender = users?.find(
              user => user.user.id === message.senderId
            );
            return (
              <div
                key={message.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  {sender?.user?.imageUrl && (
                    <img
                      src={sender?.user?.imageUrl}
                      alt={sender?.user?.firstName || ''}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{sender?.user?.firstName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p
                  className="text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: generateHTML(
                      JSON.parse(message.content ?? ''),
                      extensions as AnyExtension[]
                    )
                  }}
                ></p>
              </div>
            );
          })}

        {messages.filter(message => !message?.readByUserIds?.includes(user.id))
          .length === 0 && (
          <p className="text-center text-gray-500">No unread messages</p>
        )}
      </div>
    </div>
  );
}
