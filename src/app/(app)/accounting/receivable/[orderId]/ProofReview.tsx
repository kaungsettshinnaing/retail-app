"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPaymentProof, rejectPaymentProof } from "../actions";
import { accountingDict } from "@/lib/i18n/dict/accounting";
import type { Language } from "@/lib/i18n/language";

export default function ProofReview({ proofId, status, lang }: { proofId: string; status: string; lang: Language }) {
  const t = accountingDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        const code = res.error;
        setError((code && code in t ? t[code as keyof typeof t] : code) ?? t.errSomethingWrong);
      } else router.refresh();
    });
  }

  return (
    <div className="card space-y-3">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      {status === "PENDING" && (
        <div className="flex gap-2">
          <button disabled={pending} onClick={() => run(() => confirmPaymentProof(proofId))} className="btn-primary">
            {t.confirmPayment}
          </button>
          <button disabled={pending} onClick={() => run(() => rejectPaymentProof(proofId))} className="btn-outline">
            {t.reject}
          </button>
        </div>
      )}

      {status === "CONFIRMED" && <p className="text-sm text-green-700">{t.paymentConfirmed}</p>}
      {status === "REJECTED" && <p className="text-sm text-red-600">{t.paymentRejected}</p>}
    </div>
  );
}
