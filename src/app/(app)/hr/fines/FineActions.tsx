"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFine, deleteFine } from "./actions";
import { hrDict } from "@/lib/i18n/dict/hr";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function CreateFineForm({
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
  const now = new Date();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createFine(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  const errorText = error && error in t ? t[error as keyof typeof t] : error;

  return (
    <div className="card">
      <h2 className="section-title text-sm mb-3">{t.addFineTitle}</h2>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select name="employeeId" required className="input" disabled={pending}>
          <option value="">{t.selectEmployeePlaceholder}</option>
          {employees.map((e) => (
            <option key={e.userId} value={e.userId}>{e.name}</option>
          ))}
        </select>
        <input name="amount" type="number" min="1" required placeholder={t.amountMmkPlaceholder} className="input" disabled={pending} />
        <input name="reason" required placeholder={t.reasonPlaceholder} className="input" disabled={pending} />
        <select name="deductMonth" className="input" defaultValue={now.getMonth() + 1} disabled={pending}>
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <input name="deductYear" type="number" defaultValue={now.getFullYear()} className="input" disabled={pending} />
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-5" disabled={pending}>
          {pending ? c.saving : t.addFineBtn}
        </button>
      </form>
      {errorText && <p className="mt-2 text-sm text-red-600">{errorText}</p>}
    </div>
  );
}

export function DeleteFineButton({ id, lang }: { id: string; lang: Language }) {
  const c = commonDict[lang];
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await deleteFine(id);
        router.refresh();
      })}
      className="text-xs text-red-500 hover:underline disabled:opacity-60"
    >
      {c.delete}
    </button>
  );
}
