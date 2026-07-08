"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "./actions";

type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export default function ExpenseForm({ categories, suppliers }: { categories: Category[]; suppliers: Supplier[] }) {
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
        setError(res.error ?? "Something went wrong");
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="card space-y-3">
      <div className="section-title text-base">Record Expense</div>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Category</label>
          <select name="categoryId" className="input w-full" required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Amount</label>
          <input type="number" name="amount" min={1} className="input w-full" required />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600 block mb-1">Description</label>
          <input type="text" name="description" className="input w-full" required />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Date</label>
          <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input w-full" required />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Payment Method</label>
          <select name="paymentMethod" className="input w-full" required>
            <option value="CASH">Cash</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Supplier (optional)</label>
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
          <label className="text-sm text-gray-600 block mb-1">Receipt (optional)</label>
          <input type="file" name="receipt" accept="image/*" className="input w-full" />
        </div>
      </div>

      <button disabled={pending} type="submit" className="btn-primary">
        Save Expense
      </button>
    </form>
  );
}
