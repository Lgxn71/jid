import { useEffect } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import ToolBar from "./toolbar";

import { SendHorizonal } from "lucide-react";


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

function TipTap({
  description,
  onChange,
  onSubmit,
  maxLength = 500
}: {
  description: string;
  onChange: (richText: string) => void;
  onSubmit: () => void;
  maxLength?: number;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: { class: 'mb-1' }
        },
        blockquote: false,
        codeBlock: false
      }),
      Placeholder.configure({
        placeholder: 'Type your message...',
        emptyEditorClass: 'text-gray-400 italic focus:outline-none focus:ring-0'
      }),
      CharacterCount.configure({ limit: maxLength }) // Set character limit
    ],
    content: description || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'text-white w-full min-h-[50px] bg-[#262626] px-3 py-2 text-sm focus:outline-none  placeholder-gray-400'
      },
      handleKeyDown(view, event) {
        if (event.key === "Enter" && !event.shiftKey) {
          // prob rearrange them

          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== description) {
      editor.commands.setContent(description || '<p></p>');
    }
  }, [description, editor]);

  return (
    <div className="group focus-within:border-[#525151] bg-[#262626] w-full rounded-md border border-[#343434]">
      <ToolBar editor={editor} />

      <EditorContent editor={editor} />

      {editor && (
        <div className="flex flex-row justify-between py-2 px-2">
          <div className=" text-xs group-focus-within:text-[#a4a4a4] text-[#4e4d4d] mt-1">
            {editor.storage.characterCount.characters()}/{maxLength}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <SendHorizonal
                  className=" group-focus-within:text-[#a4a4a4] text-[#4e4d4d] w-4 h-4"
                  onClick={onSubmit}
                />
              </TooltipTrigger>
              <TooltipContent className=" text-[16px] flex flex-col">
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
