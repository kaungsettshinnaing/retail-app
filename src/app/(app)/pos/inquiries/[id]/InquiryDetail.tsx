"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { quoteInquiry, closeInquiry, markInquiryConverted } from "../actions";
import { posDict } from "@/lib/i18n/dict/pos";
import type { Language } from "@/lib/i18n/language";

export default function InquiryDetail({
  inquiryId,
  productId,
  status,
  quotedPrice,
  lang,
}: {
  inquiryId: string;
  productId: string;
  status: string;
  quotedPrice: number | null;
  lang: Language;
}) {
  const t = posDict[lang];
  const [price, setPrice] = useState(quotedPrice ?? 0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function resolveError(key?: string): string {
    if (!key) return t.genericError;
    return key in t ? (t as Record<string, unknown>)[key] as string : key;
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(resolveError(res.error));
      else router.refresh();
    });
  }

  function convertAndOpenPos() {
    setError("");
    startTransition(async () => {
      const res = await markInquiryConverted(inquiryId);
      if (!res.ok) {
        setError(resolveError(res.error));
        return;
      }
      const params = new URLSearchParams({
        inquiryProductId: productId,
        inquiryPrice: String(quotedPrice ?? 0),
      });
      router.push(`/pos?${params.toString()}`);
    });
  }

  return (
    <div className="card space-y-3">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      {status === "OPEN" && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">{t.quotePriceLabel}</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input flex-1"
            />
            <button disabled={pending} onClick={() => run(() => quoteInquiry(inquiryId, price))} className="btn-primary">
              {t.sendQuote}
            </button>
          </div>
        </div>
      )}

      {status === "QUOTED" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {t.quotedPriceLabel} <strong>{quotedPrice != null ? formatMoney(quotedPrice) : "—"}</strong>
          </p>
          <p className="text-xs text-gray-400">
            {t.convertHelpText}
          </p>
          <div className="flex gap-2">
            <button disabled={pending} onClick={convertAndOpenPos} className="btn-primary">
              {t.convertAndOpenPos}
            </button>
            <button disabled={pending} onClick={() => run(() => closeInquiry(inquiryId))} className="btn-outline">
              {t.closeInquiryBtn}
            </button>
          </div>
        </div>
      )}

      {status === "CONVERTED" && <p className="text-sm text-green-700">{t.convertedMessage}</p>}
      {status === "CLOSED" && <p className="text-sm text-gray-500">{t.closedMessage}</p>}
    </div>
  );
}
