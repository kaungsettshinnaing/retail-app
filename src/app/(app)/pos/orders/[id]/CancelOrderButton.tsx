"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/app/(app)/warehouse/orders/actions";
import { posDict } from "@/lib/i18n/dict/pos";
import { warehouseDict } from "@/lib/i18n/dict/warehouse";
import type { Language } from "@/lib/i18n/language";

const CANCELLABLE = ["PENDING", "PICKING", "PACKED", "READY"];

export default function CancelOrderButton({
  orderId,
  orderStatus,
  lang,
}: {
  orderId: string;
  orderStatus: string;
  lang: Language;
}) {
  const t = posDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!CANCELLABLE.includes(orderStatus)) return null;

  function onClick() {
    if (!confirm(t.cancelOrderConfirm)) return;
    setError("");
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (!res.ok) {
        const wt = warehouseDict[lang];
        const key = res.error;
        setError(key && key in wt ? ((wt as unknown as Record<string, string>)[key]) : (key ?? t.genericError));
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <button disabled={pending} onClick={onClick} className="btn-outline text-red-600 border-red-200 hover:bg-red-50">
        {t.cancelOrderBtn}
      </button>
    </div>
  );
}
