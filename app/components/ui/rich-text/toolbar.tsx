import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CommandIcon
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { Toggle } from '~/components/ui/toggle';
type Props = {
  editor: Editor | null;
};
export default function ToolBar({ editor }: Props) {
  if (!editor) {
    return null;
  }
  return (
    <div className="border-b group-focus-within:text-[#a4a4a4] text-[#4e4d4d] border-border bg-transparent ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
              size="sm"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className=" text-[16px] flex flex-col">
            <p>Bold</p>
            <div className="flex items-center flex-row">
              <CommandIcon className="w-4 h-4" /> + B
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={editor.isActive('italic')}
              onPressedChange={() =>
                editor.chain().focus().toggleItalic().run()
              }
              size="sm"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className=" text-[16px] flex flex-col">
            <p>Italic</p>
            <div className="flex items-center flex-row">
              <CommandIcon className="w-4 h-4" /> + I
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={editor.isActive('strike')}
              onPressedChange={() =>
                editor.chain().focus().toggleStrike().run()
              }
              size="sm"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className=" text-[16px] flex flex-col">
            <p>Strikethrough</p>
            <div className="flex items-center flex-row">
              <CommandIcon className="w-4 h-4" /> + S
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={editor.isActive('orderedList')}
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
              size="sm"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className=" text-[16px] flex flex-col">
            <p>Order List</p>
            <div className="flex items-center flex-row">
              <CommandIcon className="w-4 h-4" /> + Shift + 7
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => {
                editor.chain().focus().toggleBulletList().run();
              }}
              size="sm"
            >
              <List className="h-4 w-4" />

              {/* why ?  submits message */}
              {/* PROBABLY BUTTON M */}
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className=" text-[16px] flex flex-col">
            <p>Bullet List</p>
            <div className="flex items-center flex-row">
              <CommandIcon className="w-4 h-4" /> + Shift + 8
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
