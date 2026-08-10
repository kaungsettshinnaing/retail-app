"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeaveRequest, reviewLeave } from "./actions";
import { hrDict } from "@/lib/i18n/dict/hr";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

export function LeaveRequestForm({
  employees,
  lang,
}: {
  employees: { userId: string; name: string }[];
  lang: Language;
}) {
  const t = hrDict[lang];
  const c = commonDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createLeaveRequest(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const errorText = error && error in t ? t[error as keyof typeof t] : error;

  return (
    <div className="card">
      <h2 className="section-title text-sm mb-3">{t.logLeaveRequestTitle}</h2>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-5">
        <select name="employeeId" required className="input" disabled={pending}>
          <option value="">{t.employeeSelectPlaceholder}</option>
          {employees.map((e) => (
            <option key={e.userId} value={e.userId}>{e.name}</option>
          ))}
        </select>
        <input name="startDate" type="date" required className="input" disabled={pending} />
        <input name="endDate" type="date" required className="input" disabled={pending} />
        <input name="reason" className="input" placeholder={t.reasonOptionalPlaceholder} disabled={pending} />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? c.saving : t.logRequestBtn}
        </button>
      </form>
      {errorText && <p className="mt-2 text-sm text-red-600">{errorText}</p>}
    </div>
  );
}

export function LeaveReviewButtons({ id, lang }: { id: string; lang: Language }) {
  const t = hrDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function decide(decision: "APPROVED" | "REJECTED") {
    setError("");
    startTransition(async () => {
      const res = await reviewLeave(id, decision);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const errorText = error && error in t ? t[error as keyof typeof t] : error;

  return (
    <div className="flex items-center gap-2">
      <button disabled={pending} onClick={() => decide("APPROVED")}
        className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-60">
        {t.approveBtn}
      </button>
      <button disabled={pending} onClick={() => decide("REJECTED")}
        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60">
        {t.rejectBtn}
      </button>
      {errorText && <span className="text-xs text-red-600">{errorText}</span>}
    </div>
  );
}
