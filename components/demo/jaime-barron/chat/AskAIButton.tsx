"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { ImmigrationChatSheet } from "./ImmigrationChatSheet";

export function AskAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ImmigrationChatSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating button — hidden when chat is open on mobile */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg px-5 py-3 font-semibold text-sm transition-all duration-200 ${
          isOpen
            ? "bg-slate-700 text-white hover:bg-slate-800 sm:flex hidden"
            : "bg-[#a9f04d] text-slate-950 hover:bg-[#97d844] hover:scale-105"
        }`}
        aria-label={isOpen ? "Close AI assistant" : "Ask AI a question"}
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4" />
            Close
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </>
        )}
      </button>
    </>
  );
}
