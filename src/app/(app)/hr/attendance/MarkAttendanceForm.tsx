"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAttendance } from "./actions";
import { hrDict } from "@/lib/i18n/dict/hr";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

const STATUSES = ["PRESENT", "ABSENT", "LEAVE", "REST_DAY", "OT"] as const;

export default function MarkAttendanceForm({
  employees,
  today,
  lang,
}: {
  employees: { userId: string; name: string }[];
  today: string;
  lang: Language;
}) {
  const t = hrDict[lang];
  const c = commonDict[lang];
  const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
    PRESENT: t.statusPresent,
    ABSENT: t.statusAbsent,
    LEAVE: t.statusLeave,
    REST_DAY: t.statusRestDay,
    OT: t.statusOt,
  };
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await markAttendance(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const errorText = error && error in t ? t[error as keyof typeof t] : error;

  return (
    <div className="card">
      <h2 className="section-title text-sm mb-3">{t.markAttendanceTitle}</h2>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-6">
        <select name="employeeId" required className="input" disabled={pending}>
          <option value="">{t.employeeSelectPlaceholder}</option>
          {employees.map((e) => (
            <option key={e.userId} value={e.userId}>{e.name}</option>
          ))}
        </select>
        <input name="date" type="date" required defaultValue={today} className="input" disabled={pending} />
        <select name="status" className="input" disabled={pending}>
          <option value="">{t.clearOption}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select name="dayType" className="input" disabled={pending} defaultValue="FULL">
          <option value="FULL">{t.fullDayOption}</option>
          <option value="HALF">{t.halfDayOption}</option>
        </select>
        <input name="note" className="input" placeholder={t.notePlaceholderOptional} disabled={pending} />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? c.saving : t.markBtn}
        </button>
      </form>
      {errorText && <p className="mt-2 text-sm text-red-600">{errorText}</p>}
    </div>
  );
}
