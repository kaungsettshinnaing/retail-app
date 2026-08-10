"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordInvoicePayment } from "./actions";
import { accountingDict } from "@/lib/i18n/dict/accounting";
import type { Language } from "@/lib/i18n/language";

export default function PaymentForm({ invoiceId, lang }: { invoiceId: string; lang: Language }) {
  const t = accountingDict[lang];
  const [method, setMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    setError("");
    startTransition(async () => {
      const res = await recordInvoicePayment(invoiceId, method);
      if (!res.ok) {
        const code = res.error;
        setError((code && code in t ? t[code as keyof typeof t] : code) ?? t.errSomethingWrong);
      } else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <select value={method} onChange={(e) => setMethod(e.target.value as "CASH" | "TRANSFER")} className="input py-1 text-sm">
        <option value="CASH">{t.paymentMethodCash}</option>
        <option value="TRANSFER">{t.paymentMethodTransfer}</option>
      </select>
      <button disabled={pending} onClick={submit} className="btn-primary text-sm py-1">
        {t.recordPayment}
      </button>
    </div>
  );
}
