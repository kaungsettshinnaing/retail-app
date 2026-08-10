"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "./actions";
import { accountingDict } from "@/lib/i18n/dict/accounting";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export default function ExpenseForm({
  categories,
  suppliers,
  lang,
}: {
  categories: Category[];
  suppliers: Supplier[];
  lang: Language;
}) {
  const t = accountingDict[lang];
  const c = commonDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      const res = await createExpense(formData);
      if (!res.ok) {
        const code = res.error;
        setError((code && code in t ? t[code as keyof typeof t] : code) ?? t.errSomethingWrong);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="card space-y-3">
      <div className="section-title text-base">{t.recordExpense}</div>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.categoryLabel}</label>
          <select name="categoryId" className="input w-full" required>
            <option value="">{t.selectCategory}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.colAmount}</label>
          <input type="number" name="amount" min={1} className="input w-full" required />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600 block mb-1">{t.colDescription}</label>
          <input type="text" name="description" className="input w-full" required />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">{c.date}</label>
          <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input w-full" required />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.paymentMethodLabel}</label>
          <select name="paymentMethod" className="input w-full" required>
            <option value="CASH">{t.paymentMethodCash}</option>
            <option value="TRANSFER">{t.paymentMethodTransfer}</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.supplierLabel}</label>
          <select name="supplierId" className="input w-full">
            <option value="">—</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">{t.receiptLabel}</label>
          <input type="file" name="receipt" accept="image/*" className="input w-full" />
        </div>
      </div>

      <button disabled={pending} type="submit" className="btn-primary">
        {t.saveExpense}
      </button>
    </form>
  );
}
