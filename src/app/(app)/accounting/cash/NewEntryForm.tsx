"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualCashEntry } from "./actions";
import { accountingDict } from "@/lib/i18n/dict/accounting";
import type { Language } from "@/lib/i18n/language";

export default function NewEntryForm({ date, lang }: { date: string; lang: Language }) {
  const t = accountingDict[lang];
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    setError("");
    startTransition(async () => {
      const res = await createManualCashEntry({ type, amount, description, date });
      if (!res.ok) {
        const code = res.error;
        setError((code && code in t ? t[code as keyof typeof t] : code) ?? t.errSomethingWrong);
        return;
      }
      setAmount(0);
      setDescription("");
      router.refresh();
    });
  }

  return (
    <div className="card space-y-3">
      <div className="section-title text-base">{t.newManualEntry}</div>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.typeLabel}</label>
          <select value={type} onChange={(e) => setType(e.target.value as "IN" | "OUT")} className="input">
            <option value="IN">{t.cashIn}</option>
            <option value="OUT">{t.cashOut}</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.colAmount}</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="input w-32"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm text-gray-600 block mb-1">{t.colDescription}</label>
          <input
            type="text"
            placeholder={t.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full"
          />
        </div>
        <button disabled={pending} onClick={submit} className="btn-primary">
          {t.addEntry}
        </button>
      </div>
    </div>
  );
}
