"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the actual TipTap components with ssr disabled
const TipTapEditorInner = dynamic(
  () => import("@/components/clinical/TipTapEditorInner").then((mod) => ({ default: mod.TipTapEditorInner })),
  { ssr: false, loading: () => <LoadingPlaceholder /> }
);

function LoadingPlaceholder() {
  return (
    <div className="w-full min-h-[200px] p-4 border rounded-md bg-gray-50 flex items-center justify-center">
      <span className="text-gray-500 text-sm">Loading editor...</span>
    </div>
  );
}

export function TipTapEditor({
  content,
  onChange,
}: {
  content?: string;
  onChange?: (html: string) => void;
}) {
  return <TipTapEditorInner content={content || ""} onChange={onChange} />;
}
