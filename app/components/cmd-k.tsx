'use client';

import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList
} from '~/components/ui/command';
import { Button } from './ui/button';
import { Loader2, MessageSquare, RefreshCw } from 'lucide-react';
import { TaskDiffModal } from './task-diff-modal';
import { Task } from '@prisma/client';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for security
marked.setOptions({
  headerIds: false,
  mangle: false
});

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskDiff, setShowTaskDiff] = useState(false);
  const [taskDiff, setTaskDiff] = useState<{
    original?: Task;
    modified?: Partial<Task>;
  }>();

  // Parse markdown and sanitize HTML
  const parsedResponse = aiResponse
    ? DOMPurify.sanitize(marked.parse(aiResponse))
    : '';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleAIChat = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setAiResponse('');

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      setIsLoading(false);
      setAiResponse('Sorry, there was an error processing your request.');
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);

      try {
        const parsed = JSON.parse(chunk);
        if (parsed.type === 'task_diff') {
          setTaskDiff(parsed.data);
          setShowTaskDiff(true);
        } else {
          setAiResponse(prev => prev + parsed.content);
        }
      } catch {
        setAiResponse(prev => prev + chunk);
      }
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIChat();
    }
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col h-[80vh]">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {aiResponse && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: parsedResponse }}
                  className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                />
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <CommandList className="flex-1">
                <CommandInput
                  placeholder="Ask about tasks..."
                  value={query}
                  onValueChange={setQuery}
                  onKeyDown={handleKeyDown}
                />
              </CommandList>
              <Button
                onClick={handleAIChat}
                disabled={isLoading || !query.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </Button>
              {aiResponse && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setQuery('');
                    setAiResponse('');
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CommandDialog>

      <TaskDiffModal
        open={showTaskDiff}
        onOpenChange={setShowTaskDiff}
        original={taskDiff?.original}
        modified={taskDiff?.modified}
      />
    </>
  );
}
