"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPaymentProof } from "../../checkout/actions";
import { storeDict } from "@/lib/i18n/dict/store";
import type { Language } from "@/lib/i18n/language";

export default function ProofUpload({ orderId, lang }: { orderId: string; lang: Language }) {
  const t = storeDict[lang];
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError(t.selectImageFirst); return; }
    const formData = new FormData();
    formData.set("file", file);
    setError("");
    startTransition(async () => {
      const res = await uploadPaymentProof(orderId, formData);
      if (!res.ok) setError(res.error in t ? (t[res.error as keyof typeof t] as string) : res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
      <button onClick={handleUpload} disabled={pending} className="btn-outline text-sm">
        {pending ? t.uploading : t.uploadProof}
      </button>
    </div>
  );
}
