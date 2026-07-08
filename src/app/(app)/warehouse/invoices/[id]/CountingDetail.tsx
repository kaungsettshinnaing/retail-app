"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import { updateCount, confirmPlacement } from "../actions";

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

function itemLabel(item: Item): string {
  if (item.variant) {
    const opts = item.variant.optionValues as Record<string, string> | null;
    const optStr = opts && Object.keys(opts).length ? ` (${Object.values(opts).join(" / ")})` : "";
    return `${item.variant.sku}${optStr}`;
  }
  return item.description || "Unmapped item";
}

function CountRow({ item, locations, editable }: { item: Item; locations: Location[]; editable: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const res = await updateCount(item.id, formData);
      if (!res.ok) { setError(res.error); return; }
      setError("");
      router.refresh();
    });
  }

  const mismatch = item.countedQty != null && item.countedQty !== item.invoicedQty;

  return (
    <tr className={mismatch ? "bg-amber-50" : ""}>
      <td className="py-2 px-3 text-sm">{itemLabel(item)}</td>
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
                  <option value="">— Location —</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{locationLabel(l)}</option>
                  ))}
                </select>
              )}
              <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">
                {isPending ? "…" : "Save"}
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

export default function CountingDetail({ invoice, locations }: { invoice: Invoice; locations: Location[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const editable = invoice.status === "SUBMITTED" || invoice.status === "COUNTING";

  function handleConfirm() {
    if (!confirm("Confirm placement? This will add counted quantities to stock at the assigned locations.")) return;
    startTransition(async () => {
      const res = await confirmPlacement(invoice.id);
      if (!res.ok) { setError(res.error); return; }
      setError("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{invoice.supplier?.name ?? "Supplier Invoice"}</h1>
          <p className="text-sm text-gray-500">
            {invoice.invoiceNo ? `Invoice #${invoice.invoiceNo} — ` : ""}{formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <span className={`badge ${STATUS_STYLES[invoice.status] ?? ""}`}>{invoice.status}</span>
      </div>

      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Item</th>
              <th className="py-2 px-3 text-center">Invoiced Qty</th>
              <th className="py-2 px-3 text-center">{editable ? "Count & Location" : "Counted"}</th>
              {!editable && <th className="py-2 px-3 text-center">Placed</th>}
              <th className="py-2 px-3 text-right">Unit Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item) => (
              <CountRow key={item.id} item={item} locations={locations} editable={editable} />
            ))}
          </tbody>
        </table>
      </div>

      {editable && (
        <button onClick={handleConfirm} disabled={isPending} className="btn-primary text-sm px-4 py-2">
          {isPending ? "Placing…" : "Confirm Placement"}
        </button>
      )}

      {(invoice.cashier || invoice.counter) && (
        <div className="card text-sm text-gray-600 space-y-1">
          {invoice.cashier && <p>Submitted by <strong>{invoice.cashier.name}</strong></p>}
          {invoice.counter && <p>Counted by <strong>{invoice.counter.name}</strong></p>}
        </div>
      )}

      {invoice.logs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity</h3>
          <ul className="space-y-1 text-xs text-gray-500">
            {invoice.logs.map((log) => (
              <li key={log.id}>
                {formatDateTime(log.createdAt)} — <strong>{log.actor.name}</strong> {log.action}
                {log.note ? `: ${log.note}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
