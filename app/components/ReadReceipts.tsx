import { User } from '@prisma/client'
import { useEffect } from 'react'

interface ReadReceiptsProps {
  readByUserIds: string[]
  messageId: string
  onMarkAsRead?: (messageId: string) => void
}

export function ReadReceipts({ readByUserIds, messageId, onMarkAsRead }: ReadReceiptsProps) {
  useEffect(() => {
    onMarkAsRead?.(messageId)
  }, [messageId, onMarkAsRead])

  if (readByUserIds.length === 0) return null

  return (
    <div className="text-xs text-gray-500 mt-1">
      Read by {readByUserIds.length} users
    </div>
  )
} 