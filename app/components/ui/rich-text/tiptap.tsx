import { useEditor, EditorContent } from "@tiptap/react";
import { Heading } from "@tiptap/extension-heading";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { BulletList } from "@tiptap/extension-bullet-list";

import StarterKit from "@tiptap/starter-kit";
import ToolBar from "./toolbar";

function TipTap({
  description,
  onChange,
}: {
  description: string;
  onChange: (richText: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),

      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal",
        },
      }),
      Heading.configure({
        HTMLAttributes: {
          class: "text-xl font-bold",
          level: [2],
        },
      }),
    ],
    content: description,
    editorProps: {
      attributes: {
        class:
          "flex text-black min-h-[150px] w-[70%] rounded-md border border-input bg-white px-3 py-1  text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ",
      },
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      console.log(editor.getHTML());
    },
  });
  return (
    <div className="flex   flex-col justify-stretch min-h-[250px]">
      <ToolBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default TipTap;
