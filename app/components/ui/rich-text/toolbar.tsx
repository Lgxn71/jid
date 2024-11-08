import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CommandIcon,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Toggle } from "~/components/ui/toggle";
type Props = {
  editor: Editor | null;
};
export default function ToolBar({ editor }: Props) {
  if (!editor) {
    return null;
  }
  return (
    <div className="border-b group-focus-within:text-[#a4a4a4] text-[#4e4d4d] group-focus-within:border-[#525151] border-[#343434] bg-transparent ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Toggle
              pressed={editor.isActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
              size="sm"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold</p>
            <br />
            <div className="flex flex-row">
              <CommandIcon className="w-4 h-4" /> + B
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Toggle
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        size="sm"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        size="sm"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        size="sm"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        size="sm"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
