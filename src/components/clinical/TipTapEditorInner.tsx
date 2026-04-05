"use client";

import { useEffect } from "react";
// TipTap is only imported in this file, so it won't load until this component mounts
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function TipTapEditorInner({
  content,
  onChange,
}: {
  content: string;
  onChange?: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] border rounded-md p-4 bg-white",
      },
    },
  });

  // Cleanup editor on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return <div className="h-[200px] animate-pulse bg-gray-100 rounded-md" />;
  }

  return <EditorContent editor={editor} />;
}
