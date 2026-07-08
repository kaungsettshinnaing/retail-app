"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordInvoicePayment } from "./actions";

export default function PaymentForm({ invoiceId }: { invoiceId: string }) {
  const [method, setMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    setError("");
    startTransition(async () => {
      const res = await recordInvoicePayment(invoiceId, method);
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <select value={method} onChange={(e) => setMethod(e.target.value as "CASH" | "TRANSFER")} className="input py-1 text-sm">
        <option value="CASH">Cash</option>
        <option value="TRANSFER">Transfer</option>
      </select>
      <button disabled={pending} onClick={submit} className="btn-primary text-sm py-1">
        Record Payment
      </button>
    </div>
  );
}
