"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import { updateCount, confirmPlacement } from "../actions";
import { warehouseDict } from "@/lib/i18n/dict/warehouse";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type Item = {
  id: string;
  description: string | null;
  invoicedQty: number;
  countedQty: number | null;
  finalQty: number | null;
  unitCost: number | null;
  locationId: string | null;
  placedQty: number | null;
  variantId: string | null;
  variant: { sku: string; optionValues: unknown } | null;
};
type Location = {
  id: string;
  name: string;
  area: { name: string };
  shelf: { name: string } | null;
};
type Invoice = {
  id: string;
  invoiceNo: string | null;
  invoiceDate: Date;
  status: string;
  totalAmount: number | null;
  supplier: { name: string } | null;
  cashier: { name: string } | null;
  counter: { name: string } | null;
  items: Item[];
  logs: { id: string; action: string; note: string | null; createdAt: Date; actor: { name: string } }[];
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  COUNTING: "bg-amber-100 text-amber-700",
  PLACED: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-green-100 text-green-700",
};

function locationLabel(loc: Location): string {
  return loc.shelf ? `${loc.area.name} / ${loc.shelf.name} / ${loc.name}` : `${loc.area.name} / ${loc.name}`;
}

function itemLabel(item: Item, fallback: string): string {
  if (item.variant) {
    const opts = item.variant.optionValues as Record<string, string> | null;
    const optStr = opts && Object.keys(opts).length ? ` (${Object.values(opts).join(" / ")})` : "";
    return `${item.variant.sku}${optStr}`;
  }
  return item.description || fallback;
}

function resolveError(t: typeof warehouseDict["EN"], key?: string): string {
  if (!key) return t.genericError;
  return key in t ? ((t as unknown as Record<string, string>)[key]) : key;
}

function CountRow({
  item,
  locations,
  editable,
  lang,
}: {
  item: Item;
  locations: Location[];
  editable: boolean;
  lang: Language;
}) {
  const t = warehouseDict[lang];
  const c = commonDict[lang];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const res = await updateCount(item.id, formData);
      if (!res.ok) { setError(resolveError(t, res.error)); return; }
      setError("");
      router.refresh();
    });
  }

  const mismatch = item.countedQty != null && item.countedQty !== item.invoicedQty;

  return (
    <tr className={mismatch ? "bg-amber-50" : ""}>
      <td className="py-2 px-3 text-sm">{itemLabel(item, t.unmappedItemFallback)}</td>
      <td className="py-2 px-3 text-sm text-center">{item.invoicedQty}</td>
      {editable ? (
        <>
          <td className="py-2 px-3">
            <form action={handleSave} className="flex items-center gap-2 justify-center">
              <input
                name="countedQty"
                type="number"
                min={0}
                defaultValue={item.countedQty ?? ""}
                className="input w-20 text-xs text-center"
                required
              />
              {item.variantId && (
                <select name="locationId" defaultValue={item.locationId ?? ""} className="input w-40 text-xs">
                  <option value="">{t.locationPlaceholderOption}</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{locationLabel(l)}</option>
                  ))}
                </select>
              )}
              <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">
                {isPending ? "…" : c.save}
              </button>
            </form>
            {error && <p className="text-red-600 text-xs text-center mt-1">{error}</p>}
          </td>
        </>
      ) : (
        <>
          <td className="py-2 px-3 text-sm text-center text-gray-500">{item.countedQty ?? "—"}</td>
        </>
      )}
      {!editable && (
        <td className="py-2 px-3 text-sm text-center text-gray-500">{item.placedQty ?? "—"}</td>
      )}
      <td className="py-2 px-3 text-sm text-right">{item.unitCost != null ? formatMoney(item.unitCost) : "—"}</td>
    </tr>
  );
}

export default function CountingDetail({
  invoice,
  locations,
  lang,
}: {
  invoice: Invoice;
  locations: Location[];
  lang: Language;
}) {
  const t = warehouseDict[lang];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const editable = invoice.status === "SUBMITTED" || invoice.status === "COUNTING";

  const STATUS_LABELS: Record<string, string> = {
    SUBMITTED: t.invoiceStatusSubmitted,
    COUNTING: t.invoiceStatusCounting,
    PLACED: t.invoiceStatusPlaced,
    COMPLETE: t.invoiceStatusComplete,
  };
  const LOG_ACTION_LABELS: Record<string, string> = {
    CREATED: t.logActionCreated,
    CASHIER_SUBMITTED: t.logActionCashierSubmitted,
    COUNTING: t.logActionCounting,
    PLACED: t.logActionPlaced,
  };

  function handleConfirm() {
    if (!confirm(t.confirmPlacementConfirm)) return;
    startTransition(async () => {
      const res = await confirmPlacement(invoice.id);
      if (!res.ok) { setError(resolveError(t, res.error)); return; }
      setError("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{invoice.supplier?.name ?? t.supplierInvoiceFallback}</h1>
          <p className="text-sm text-gray-500">
            {invoice.invoiceNo ? `${t.colInvoiceNo} ${invoice.invoiceNo} — ` : ""}{formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <span className={`badge ${STATUS_STYLES[invoice.status] ?? ""}`}>{STATUS_LABELS[invoice.status] ?? invoice.status}</span>
      </div>

      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.colItem}</th>
              <th className="py-2 px-3 text-center">{t.colInvoicedQty}</th>
              <th className="py-2 px-3 text-center">{editable ? t.colCountAndLocation : t.colCounted}</th>
              {!editable && <th className="py-2 px-3 text-center">{t.colPlacedQty}</th>}
              <th className="py-2 px-3 text-right">{t.colUnitCost}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item) => (
              <CountRow key={item.id} item={item} locations={locations} editable={editable} lang={lang} />
            ))}
          </tbody>
        </table>
      </div>

      {editable && (
        <button onClick={handleConfirm} disabled={isPending} className="btn-primary text-sm px-4 py-2">
          {isPending ? t.placingLabel : t.confirmPlacementBtn}
        </button>
      )}

      {(invoice.cashier || invoice.counter) && (
        <div className="card text-sm text-gray-600 space-y-1">
          {invoice.cashier && <p>{t.submittedByLabel} <strong>{invoice.cashier.name}</strong></p>}
          {invoice.counter && <p>{t.countedByLabel} <strong>{invoice.counter.name}</strong></p>}
        </div>
      )}

      {invoice.logs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.activityTitle}</h3>
          <ul className="space-y-1 text-xs text-gray-500">
            {invoice.logs.map((log) => (
              <li key={log.id}>
                {formatDateTime(log.createdAt)} — <strong>{log.actor.name}</strong> {LOG_ACTION_LABELS[log.action] ?? log.action}
                {log.note ? `: ${log.note}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
