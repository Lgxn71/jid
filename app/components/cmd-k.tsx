'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from '@remix-run/react';
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

// Create a custom renderer by extending the default one
const renderer = new marked.Renderer();
const defaultLinkRenderer = renderer.link.bind(renderer);

renderer.link = (href: string, title: string | null, text: string) => {
  if (href?.startsWith('task://')) {
    const taskId = href.replace('task://', '');
    return `<a href="#" data-task-id="${taskId}" class="text-primary hover:underline">${text}</a>`;
  }
  return defaultLinkRenderer(href, title, text);
};

export function CommandMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskDiff, setShowTaskDiff] = useState(false);
  const [taskDiff, setTaskDiff] = useState<{
    original?: Task;
    modified?: Partial<Task>;
  }>();

  const responseEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  // Parse markdown and sanitize HTML
  const parsedResponse = aiResponse
    ? DOMPurify.sanitize(marked.parse(aiResponse, { renderer }))
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

  const handleCreateTask = async (taskData: any) => {
    try {
      console.log('Creating task with data:', taskData); // Debug log
      const formattedData = {
        intent: 'CREATE_TASK',
        ...taskData,
        startAt: taskData.startAt ? new Date(taskData.startAt).toISOString() : null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        projectId: params.chatId
      };
      console.log('Formatted data:', formattedData); // Debug log

      const response = await fetch(
        `/dashboard/${params.id}/p/${params.chatId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedData)
        }
      );

      console.log('Response status:', response.status); // Debug log
      const responseData = await response.json();
      console.log('Response data:', responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create task');
      }

      setAiResponse('✅ Task created successfully!\n\nCreated task: ' + responseData.task.name);
    } catch (error) {
      console.error('Error creating task:', error);
      setAiResponse('❌ Failed to create task. Error: ' + error.message);
    }
  };

  const handleAIChat = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;

        try {
          // Try to parse the accumulated response as JSON
          const parsed = JSON.parse(accumulatedResponse);
          if (parsed.type === 'task_diff') {
            if (!parsed.data.original) {
              // This is a new task request
              await handleCreateTask(parsed.data.modified);
              setAiResponse('✅ Task created successfully!');
            } else {
              // This is a task modification request
              setTaskDiff(parsed.data);
              setShowTaskDiff(true);
            }
            break; // Exit after handling task creation/modification
          }
        } catch {
          // If it's not valid JSON yet, continue accumulating
          setAiResponse(accumulatedResponse);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setAiResponse(
        'Sorry, there was an error processing your request.'
      );
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex flex-col h-[80vh]" ref={dialogRef}>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {query && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="font-medium">You:</p>
                <p>{query}</p>
              </div>
            )}

            {aiResponse && (
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="font-medium mb-2">AI Assistant:</p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: parsedResponse }}
                    className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  />
                </div>
              </div>
            )}
            <div ref={responseEndRef} />
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
