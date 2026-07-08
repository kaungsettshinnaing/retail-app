"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { quoteInquiry, closeInquiry, markInquiryConverted } from "../actions";

export default function InquiryDetail({
  inquiryId,
  status,
  quotedPrice,
}: {
  inquiryId: string;
  status: string;
  quotedPrice: number | null;
}) {
  const [price, setPrice] = useState(quotedPrice ?? 0);
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

      {status === "OPEN" && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Quote a price</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input flex-1"
            />
            <button disabled={pending} onClick={() => run(() => quoteInquiry(inquiryId, price))} className="btn-primary">
              Send Quote
            </button>
          </div>
        </div>
      )}

      {status === "QUOTED" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Quoted price: <strong>{quotedPrice != null ? formatMoney(quotedPrice) : "—"}</strong>
          </p>
          <p className="text-xs text-gray-400">
            Contact the customer, then create their order at POS with this price. Once placed, mark this inquiry converted.
          </p>
          <div className="flex gap-2">
            <button disabled={pending} onClick={() => run(() => markInquiryConverted(inquiryId))} className="btn-primary">
              Mark Converted
            </button>
            <button disabled={pending} onClick={() => run(() => closeInquiry(inquiryId))} className="btn-outline">
              Close Inquiry
            </button>
          </div>
        </div>
      )}

      {status === "CONVERTED" && <p className="text-sm text-green-700">This inquiry converted to an order.</p>}
      {status === "CLOSED" && <p className="text-sm text-gray-500">This inquiry is closed.</p>}
    </div>
  );
}
