"use client";

import { useState, useTransition } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createInvoice } from "../actions";
import { posDict } from "@/lib/i18n/dict/pos";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

export default function NewInvoiceForm({
  suppliers,
  lang,
}: {
  suppliers: { id: string; name: string }[];
  lang: Language;
}) {
  const t = posDict[lang];
  const c = commonDict[lang];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createInvoice(formData);
      if (res && !res.ok) setError(res.error);
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="card">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.supplierRequiredLabel}</label>
          <select name="supplierId" className="input w-full" required>
            <option value="">{t.selectSupplierOption}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.invoiceNoLabel}</label>
          <input name="invoiceNo" className="input w-full" placeholder={c.optional} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.invoiceDateRequiredLabel}</label>
          <input name="invoiceDate" type="date" defaultValue={today} className="input w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.formNotesLabel}</label>
          <textarea name="notes" className="input w-full" rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <SubmitButton className="btn-primary" pendingText={t.creatingLabel}>{t.createDraftBtn}</SubmitButton>
          <a href="/pos/invoices" className="btn-outline text-sm px-4 py-2 text-center">{c.cancel}</a>
        </div>
      </form>
    </div>
  );
}
