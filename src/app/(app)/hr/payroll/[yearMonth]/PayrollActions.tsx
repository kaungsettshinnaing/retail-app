"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generatePayroll, lockPayroll } from "./actions";
import { hrDict } from "@/lib/i18n/dict/hr";
import type { Language } from "@/lib/i18n/language";

export default function PayrollActions({
  yearMonth,
  hasPayroll,
  hasItems,
  lang,
}: {
  yearMonth: string;
  hasPayroll: boolean;
  hasItems: boolean;
  lang: Language;
}) {
  const t = hrDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function generate() {
    setError("");
    startTransition(async () => {
      const res = await generatePayroll(yearMonth);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function lock() {
    if (!confirm(t.lockConfirmMsg)) return;
    setError("");
    startTransition(async () => {
      const res = await lockPayroll(yearMonth);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const errorText = error && error in t ? t[error as keyof typeof t] : error;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button disabled={pending} onClick={generate} className="btn-primary">
          {pending ? t.workingEllipsis : hasPayroll ? t.regenerateBtn : t.generateBtn}
        </button>
        {hasPayroll && hasItems && (
          <button
            disabled={pending}
            onClick={lock}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {t.lockPayrollBtn}
          </button>
        )}
      </div>
      {errorText && <p className="text-sm text-red-600">{errorText}</p>}
    </div>
  );
}
