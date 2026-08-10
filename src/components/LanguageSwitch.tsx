"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguageCookie } from "@/lib/i18n/actions";
import { LANGUAGES, LANGUAGE_LABEL, type Language } from "@/lib/i18n/language";

export default function LanguageSwitch({
  lang,
  variant = "light",
}: {
  lang: Language;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Language) {
    if (next === lang || pending) return;
    startTransition(async () => {
      await setLanguageCookie(next);
      router.refresh();
    });
  }

  const inactiveClass =
    variant === "dark" ? "text-white/70 hover:bg-white/15 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800";
  const activeClass = variant === "dark" ? "bg-accent text-brand-dark" : "bg-brand text-white";

  return (
    <div className="inline-flex items-center gap-1 text-xs font-medium">
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          disabled={pending}
          className={"rounded-full px-2.5 py-1 transition-colors " + (code === lang ? activeClass : inactiveClass)}
        >
          {LANGUAGE_LABEL[code]}
        </button>
      ))}
    </div>
  );
}
