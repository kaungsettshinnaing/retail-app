"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleEmployeeActive } from "../actions";
import { hrDict } from "@/lib/i18n/dict/hr";
import type { Language } from "@/lib/i18n/language";

export default function EmployeeActiveToggle({
  userId,
  isActive,
  lang,
}: {
  userId: string;
  isActive: boolean;
  lang: Language;
}) {
  const t = hrDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    setError("");
    startTransition(async () => {
      const res = await toggleEmployeeActive(userId, !isActive);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const errorText = error && error in t ? t[error as keyof typeof t] : error;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={toggle}
        className={`btn-outline text-sm px-4 py-2 ${isActive ? "text-red-600" : "text-green-700"}`}
      >
        {isActive ? t.deactivateBtn : t.activateBtn}
      </button>
      {errorText && <span className="text-xs text-red-600">{errorText}</span>}
    </div>
  );
}
