import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
type Props = {
  editor: Editor | null;
};
export default function ToolBar({ editor }: Props) {
  if (!editor) {
    return null;
  }
  return (
    <div className="border border-input bg-transparent rounded">
      <Toggle
        pressed={editor.isActive("heading")}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        size="sm"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        size="sm"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
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
