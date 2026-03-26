"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ImmigrationChatSheet } from "./ImmigrationChatSheet";

export function AskAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ImmigrationChatSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#a9f04d] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#97d844]"
          aria-label="Ask AI a question"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </button>
      )}
    </>
  );
}
