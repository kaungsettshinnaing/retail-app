"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmItemPicked,
  markItemUnavailable,
  markOrderPacked,
  markOrderReady,
  completeOrder,
} from "../actions";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PICKED: "bg-green-100 text-green-700",
  UNAVAILABLE: "bg-red-100 text-red-600",
};

type Item = {
  id: string;
  productName: string;
  variantSku: string | null;
  variantOptions: Record<string, string> | null;
  productType: string;
  qty: number;
  status: string;
  locations: { label: string; qty: number }[];
};

export default function PickingDetail({
  orderId,
  orderStatus,
  items,
}: {
  orderId: string;
  orderStatus: string;
  items: Item[];
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const allResolved = items.every((i) => i.status !== "PENDING");

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Item</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-left">Location(s)</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="py-2 px-3 text-sm">
                  {it.productName}
                  {it.variantSku && <span className="text-xs text-gray-400"> — {it.variantSku}</span>}
                  {it.variantOptions && Object.keys(it.variantOptions).length > 0 && (
                    <span className="text-xs text-gray-400"> ({Object.values(it.variantOptions).join(" / ")})</span>
                  )}
                </td>
                <td className="py-2 px-3 text-sm text-center">{it.qty}</td>
                <td className="py-2 px-3 text-xs text-gray-500">
                  {it.productType === "PASS_THROUGH" ? (
                    <span className="badge bg-blue-100 text-blue-700">Supplier Order Required</span>
                  ) : it.locations.length === 0 ? (
                    "—"
                  ) : (
                    it.locations.map((l, idx) => (
                      <div key={idx}>
                        {l.label}: {l.qty}
                      </div>
                    ))
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className={`badge ${STATUS_STYLES[it.status] ?? ""}`}>{it.status}</span>
                </td>
                <td className="py-2 px-3 text-right space-x-2">
                  {it.status === "PENDING" && ["PENDING", "PICKING"].includes(orderStatus) && (
                    <>
                      <button
                        disabled={pending}
                        onClick={() => run(() => confirmItemPicked(it.id))}
                        className="text-xs text-brand hover:underline"
                      >
                        Confirm Picked
                      </button>
                      <button
                        disabled={pending}
                        onClick={() => run(() => markItemUnavailable(it.id))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Unavailable
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex gap-2">
        {orderStatus === "PICKING" && allResolved && (
          <button disabled={pending} onClick={() => run(() => markOrderPacked(orderId))} className="btn-primary">
            Mark Packed
          </button>
        )}
        {orderStatus === "PACKED" && (
          <button disabled={pending} onClick={() => run(() => markOrderReady(orderId))} className="btn-primary">
            Mark Ready
          </button>
        )}
        {orderStatus === "READY" && (
          <>
            <button disabled={pending} onClick={() => run(() => completeOrder(orderId, "PICKED_UP"))} className="btn-primary">
              Picked Up by Customer
            </button>
            <button disabled={pending} onClick={() => run(() => completeOrder(orderId, "DELIVERED"))} className="btn-outline">
              Delivered
            </button>
          </>
        )}
      </div>
    </div>
  );
}
