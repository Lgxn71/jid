'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@remix-run/react';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const runAICommand = useCallback(async () => {
    setIsLoading(true);
    setAiResponse('');

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      setIsLoading(false);
      setAiResponse('Failed to get AI response');
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setAiResponse(prev => prev + chunk);
    }

    setIsLoading(false);
  }, [query]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-x-0 top-1/4 z-50 w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95"
    >
      <div className="border-b border-gray-200 px-4">
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Type a command or ask AI a question..."
          className="w-full py-3 outline-none placeholder:text-gray-400"
        />
      </div>
      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Actions">
          <Command.Item
            onSelect={() => {
              navigate('/dashboard');
              setOpen(false);
            }}
          >
            Go to Dashboard
          </Command.Item>
          <Command.Item
            onSelect={() => {
              navigate('/settings');
              setOpen(false);
            }}
          >
            Open Settings
          </Command.Item>
          <Command.Item onSelect={runAICommand}>Ask AI</Command.Item>
        </Command.Group>

        {aiResponse && (
          <Command.Group heading="AI Response">
            <div className="px-2 py-1.5 text-sm">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              ) : (
                aiResponse
              )}
            </div>
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
