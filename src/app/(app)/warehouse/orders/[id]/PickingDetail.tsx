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
import { warehouseDict } from "@/lib/i18n/dict/warehouse";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

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
  lang,
}: {
  orderId: string;
  orderStatus: string;
  items: Item[];
  lang: Language;
}) {
  const t = warehouseDict[lang];
  const c = commonDict[lang];
  const ITEM_STATUS_LABELS: Record<string, string> = {
    PENDING: t.itemStatusPending,
    PICKED: t.itemStatusPicked,
    UNAVAILABLE: t.itemStatusUnavailable,
  };
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const allResolved = items.every((i) => i.status !== "PENDING");

  function resolveError(key?: string): string {
    if (!key) return t.genericError;
    return key in t ? ((t as unknown as Record<string, string>)[key]) : key;
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(resolveError(res.error));
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.colItem}</th>
              <th className="py-2 px-3 text-center">{t.colQty}</th>
              <th className="py-2 px-3 text-left">{t.colLocations}</th>
              <th className="py-2 px-3 text-left">{c.status}</th>
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
                    <span className="badge bg-blue-100 text-blue-700">{t.supplierOrderRequired}</span>
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
                  <span className={`badge ${STATUS_STYLES[it.status] ?? ""}`}>{ITEM_STATUS_LABELS[it.status] ?? it.status}</span>
                </td>
                <td className="py-2 px-3 text-right space-x-2">
                  {it.status === "PENDING" && ["PENDING", "PICKING"].includes(orderStatus) && (
                    <>
                      <button
                        disabled={pending}
                        onClick={() => run(() => confirmItemPicked(it.id))}
                        className="text-xs text-brand hover:underline"
                      >
                        {t.confirmPickedBtn}
                      </button>
                      <button
                        disabled={pending}
                        onClick={() => run(() => markItemUnavailable(it.id))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        {t.unavailableBtn}
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
            {t.markPackedBtn}
          </button>
        )}
        {orderStatus === "PACKED" && (
          <button disabled={pending} onClick={() => run(() => markOrderReady(orderId))} className="btn-primary">
            {t.markReadyBtn}
          </button>
        )}
        {orderStatus === "READY" && (
          <>
            <button disabled={pending} onClick={() => run(() => completeOrder(orderId, "PICKED_UP"))} className="btn-primary">
              {t.pickedUpByCustomerBtn}
            </button>
            <button disabled={pending} onClick={() => run(() => completeOrder(orderId, "DELIVERED"))} className="btn-outline">
              {t.deliveredBtn}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
