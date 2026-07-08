"use client";

import { useState, useTransition } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createInvoice } from "../actions";

export default function NewInvoiceForm({
  suppliers,
}: {
  suppliers: { id: string; name: string }[];
}) {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
          <select name="supplierId" className="input w-full" required>
            <option value="">— Select supplier —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
          <input name="invoiceNo" className="input w-full" placeholder="Optional" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
          <input name="invoiceDate" type="date" defaultValue={today} className="input w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" className="input w-full" rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <SubmitButton className="btn-primary" pendingText="Creating…">Create Draft</SubmitButton>
          <a href="/pos/invoices" className="btn-outline text-sm px-4 py-2 text-center">Cancel</a>
        </div>
      </form>
    </div>
  );
}
