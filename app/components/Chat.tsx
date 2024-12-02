import { useMessageRead } from '~/contexts/MessageReadContext'
import { ReadReceipts } from './ReadReceipts'

export function Chat({ messages }: { messages: Message[] }) {
  const { markMessageAsRead, readByUserIds } = useMessageRead()

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {/* Existing message content */}
          <ReadReceipts 
            readByUserIds={readByUserIds[message.id] || []}
            messageId={message.id}
            onMarkAsRead={markMessageAsRead}
          />
        </div>
      ))}
    </div>
  )
} 