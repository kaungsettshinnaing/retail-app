"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generatePayroll, lockPayroll } from "./actions";

export default function PayrollActions({
  yearMonth,
  hasPayroll,
  hasItems,
}: {
  yearMonth: string;
  hasPayroll: boolean;
  hasItems: boolean;
}) {
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
    if (!confirm("Lock this payroll? Advances and fines for this period will be marked as deducted, and this cannot be undone.")) return;
    setError("");
    startTransition(async () => {
      const res = await lockPayroll(yearMonth);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button disabled={pending} onClick={generate} className="btn-primary">
          {pending ? "Working…" : hasPayroll ? "Regenerate" : "Generate Payroll"}
        </button>
        {hasPayroll && hasItems && (
          <button
            disabled={pending}
            onClick={lock}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Lock Payroll
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
