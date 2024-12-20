import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export function useMarkMessageRead() {
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch('/api/message/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId })
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  return { markAsRead, ref, inView };
} 