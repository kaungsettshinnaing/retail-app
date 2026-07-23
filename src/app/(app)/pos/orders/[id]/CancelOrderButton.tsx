"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/app/(app)/warehouse/orders/actions";

const CANCELLABLE = ["PENDING", "PICKING", "PACKED", "READY"];

export default function CancelOrderButton({ orderId, orderStatus }: { orderId: string; orderStatus: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!CANCELLABLE.includes(orderStatus)) return null;

  function onClick() {
    if (!confirm("Cancel this order? Any deducted stock will be restored.")) return;
    setError("");
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <button disabled={pending} onClick={onClick} className="btn-outline text-red-600 border-red-200 hover:bg-red-50">
        Cancel Order
      </button>
    </div>
  );
}
