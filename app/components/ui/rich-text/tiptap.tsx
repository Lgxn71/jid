import { useEffect } from 'react';

import {
  useEditor,
  EditorContent,
  Extension,
  JSONContent
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import ToolBar from './toolbar';
import ListItem from '@tiptap/extension-list-item';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';

import { SendHorizonal } from 'lucide-react';

const CustomHardBreak = HardBreak.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () =>
        this.editor
          .chain()
          .selectParentNode()
          .createParagraphNear()
          .focus()
          .run(),
      'Shift-Enter': () =>
        this.editor
          .chain()
          .selectParentNode()
          .createParagraphNear()
          .focus()
          .run()
    };
  }
});

export const extensions = [
  StarterKit.configure({
    paragraph: {
      HTMLAttributes: { class: 'mb-3' }
    },
    blockquote: false,
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc px-4'
      }
    },
    hardBreak: false
  }),
  Placeholder.configure({
    placeholder: 'Type your message...',
    emptyEditorClass: 'text-gray-400 italic focus:outline-none focus:ring-0'
  }),
  CharacterCount.configure({ limit: 500 }),
  CustomHardBreak,
  ListItem.extend({
    priority: 101,
    addKeyboardShortcuts() {
      return {
        'Shift-Enter': () => this.editor.commands.splitListItem(this.name),
        ////
        //// Don't forget these two commands of the parent
        Tab: () => this.editor.commands.sinkListItem(this.name),
        'Shift-Tab': () => this.editor.commands.liftListItem(this.name)
      };
    }
  }),
  Link.configure({
    HTMLAttributes: {
      class: 'text-blue-500 cursor-pointer'
    }
  })
];

function TipTap({
  description,
  onChange,
  onSubmit
}: {
  description: string;
  onChange: (richText: string) => void;
  onSubmit: () => void;
}) {
  const editor = useEditor({
    extensions,
    content: JSON.parse(description),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'text-white w-full min-h-20 bg-backhround px-3 py-2 text-sm focus:outline-none  placeholder-gray-400 max-h-48 overflow-auto'
      },
      handleKeyDown(view, event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          // prob rearrange them
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    }
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== JSON.parse(description)) {
      editor.commands.setContent(JSON.parse(description));
    }
  }, [description, editor]);

  return (
    <div className="group focus-within:border-secondary bg-background w-full rounded-md border border-border">
      <ToolBar editor={editor} />

      <EditorContent
        className="*:text-gray-700 dark:*:text-gray-300"
        editor={editor}
      />

      {editor && (
        <div className="flex flex-row justify-between py-2 px-2">
          <div className="text-xs mt-1">
            {editor.storage.characterCount.characters()}/500
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <SendHorizonal className="w-4 h-4" onClick={onSubmit} />
              </TooltipTrigger>
              <TooltipContent className="text-[16px] flex flex-col">
                <p>Send Message</p>
                <div className="flex items-center flex-row">Enter</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

export default TipTap;
