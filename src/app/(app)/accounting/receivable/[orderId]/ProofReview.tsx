"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPaymentProof, rejectPaymentProof } from "../actions";

export default function ProofReview({ proofId, status }: { proofId: string; status: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else router.refresh();
    });
  }

  return (
    <div className="card space-y-3">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      {status === "PENDING" && (
        <div className="flex gap-2">
          <button disabled={pending} onClick={() => run(() => confirmPaymentProof(proofId))} className="btn-primary">
            Confirm Payment
          </button>
          <button disabled={pending} onClick={() => run(() => rejectPaymentProof(proofId))} className="btn-outline">
            Reject
          </button>
        </div>
      )}

      {status === "CONFIRMED" && <p className="text-sm text-green-700">Payment confirmed.</p>}
      {status === "REJECTED" && <p className="text-sm text-red-600">Payment rejected. Customer must re-upload proof.</p>}
    </div>
  );
}
