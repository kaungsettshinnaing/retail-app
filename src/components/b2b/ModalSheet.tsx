"use client";

import { useEffect } from "react";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

export default function ModalSheet({
  title,
  onClose,
  children,
  wide,
  lang = "EN",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  lang?: Language;
}) {
  const c = commonDict[lang];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={`card w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-gray-400 hover:bg-gray-100"
            aria-label={c.close}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
