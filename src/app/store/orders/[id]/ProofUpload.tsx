"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPaymentProof } from "../../checkout/actions";

export default function ProofUpload({ orderId }: { orderId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Select an image first"); return; }
    const formData = new FormData();
    formData.set("file", file);
    setError("");
    startTransition(async () => {
      const res = await uploadPaymentProof(orderId, formData);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
      <button onClick={handleUpload} disabled={pending} className="btn-outline text-sm">
        {pending ? "Uploading…" : "Upload Proof"}
      </button>
    </div>
  );
}
