"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import {
  addInvoiceItem,
  updateInvoiceItem,
  deleteInvoiceItem,
  submitInvoice,
  deleteInvoice,
} from "../actions";
import { posDict } from "@/lib/i18n/dict/pos";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type Item = {
  id: string;
  variantId: string | null;
  description: string | null;
  invoicedQty: number;
  countedQty: number | null;
  finalQty: number | null;
  unitCost: number | null;
  placedQty: number | null;
};
type ProductOpt = {
  id: string;
  name: string;
  variants: { id: string; sku: string; optionValues: unknown }[];
};
type Invoice = {
  id: string;
  invoiceNo: string | null;
  invoiceDate: Date;
  status: string;
  totalAmount: number | null;
  notes: string | null;
  supplier: { name: string } | null;
  cashier: { name: string } | null;
  counter: { name: string } | null;
  items: Item[];
  logs: { id: string; action: string; note: string | null; createdAt: Date; actor: { name: string } }[];
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  COUNTING: "bg-amber-100 text-amber-700",
  PLACED: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-green-100 text-green-700",
};

function variantLabel(v: { sku: string; optionValues: unknown }): string {
  const opts = v.optionValues as Record<string, string> | null;
  const optStr = opts && Object.keys(opts).length ? ` (${Object.values(opts).join(" / ")})` : "";
  return `${v.sku}${optStr}`;
}

function resolveError(t: typeof posDict["EN"], key?: string): string {
  if (!key) return t.genericError;
  return key in t ? ((t as unknown as Record<string, unknown>)[key] as string) : key;
}

function AddItemForm({
  invoiceId,
  products,
  lang,
}: {
  invoiceId: string;
  products: ProductOpt[];
  lang: Language;
}) {
  const t = posDict[lang];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addInvoiceItem(invoiceId, formData);
      if (!res.ok) { setError(resolveError(t, res.error)); return; }
      setError("");
      router.refresh();
      (document.getElementById("add-item-form") as HTMLFormElement | null)?.reset();
    });
  }

  return (
    <form id="add-item-form" action={handleSubmit} className="flex flex-wrap gap-2 items-end bg-brand-light rounded p-3">
      {error && <p className="text-red-600 text-xs w-full">{error}</p>}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.colProductVariant}</label>
        <select name="variantId" className="input w-56 text-sm">
          <option value="">{t.unmappedItemOption}</option>
          {products.map((p) => (
            <optgroup key={p.id} label={p.name}>
              {p.variants.map((v) => (
                <option key={v.id} value={v.id}>{variantLabel(v)}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.colDescription}</label>
        <input name="description" placeholder={t.ifUnmappedPlaceholder} className="input w-40 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.colQtyRequired}</label>
        <input name="invoicedQty" type="number" min={1} className="input w-20 text-sm" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.colUnitCost}</label>
        <input name="unitCost" type="number" min={0} className="input w-24 text-sm" />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary text-sm px-3 py-2">
        {isPending ? t.addingLabel : t.addItemBtn}
      </button>
    </form>
  );
}

function ItemRow({ item, editable, lang }: { item: Item; editable: boolean; lang: Language }) {
  const t = posDict[lang];
  const c = commonDict[lang];
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateInvoiceItem(item.id, formData);
      if (!res.ok) { setError(resolveError(t, res.error)); return; }
      setEditing(false);
      setError("");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(t.removeLineItemConfirm)) return;
    startTransition(async () => {
      const res = await deleteInvoiceItem(item.id);
      if (!res.ok) alert(resolveError(t, res.error));
      router.refresh();
    });
  }

  return (
    <>
      <tr>
        <td className="py-2 px-3 text-sm">{item.description || "—"}</td>
        <td className="py-2 px-3 text-sm text-center">{item.invoicedQty}</td>
        {!editable && (
          <>
            <td className="py-2 px-3 text-sm text-center text-gray-500">{item.countedQty ?? "—"}</td>
            <td className="py-2 px-3 text-sm text-center text-gray-500">{item.finalQty ?? "—"}</td>
            <td className="py-2 px-3 text-sm text-center text-gray-500">{item.placedQty ?? "—"}</td>
          </>
        )}
        <td className="py-2 px-3 text-sm text-right">{item.unitCost != null ? formatMoney(item.unitCost) : "—"}</td>
        <td className="py-2 px-3 text-sm text-right">
          {item.unitCost != null ? formatMoney(item.unitCost * item.invoicedQty) : "—"}
        </td>
        {editable && (
          <td className="py-2 px-3 text-right space-x-2">
            <button onClick={() => setEditing(!editing)} className="text-xs text-brand hover:underline">{c.edit}</button>
            <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-500 hover:underline">{c.delete}</button>
          </td>
        )}
      </tr>
      {editing && (
        <tr>
          <td colSpan={5} className="bg-brand-light px-4 py-3">
            {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
            <form action={handleUpdate} className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.colQtyRequired.replace(" *", "")}</label>
                <input name="invoicedQty" type="number" min={1} defaultValue={item.invoicedQty} className="input w-20 text-xs" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.colUnitCost}</label>
                <input name="unitCost" type="number" min={0} defaultValue={item.unitCost ?? ""} className="input w-24 text-xs" />
              </div>
              <button type="submit" disabled={isPending} className="btn-primary text-xs px-3 py-1.5">{c.save}</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-3 py-1.5">{c.cancel}</button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

export default function InvoiceDetail({
  invoice,
  products,
  lang,
}: {
  invoice: Invoice;
  products: ProductOpt[];
  lang: Language;
}) {
  const t = posDict[lang];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const editable = invoice.status === "DRAFT";

  const STATUS_LABELS: Record<string, string> = {
    DRAFT: t.invoiceStatusDraft,
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

  function handleSubmitInvoice() {
    if (!confirm(t.submitInvoiceConfirm)) return;
    startTransition(async () => {
      const res = await submitInvoice(invoice.id);
      if (!res.ok) { setError(resolveError(t, res.error)); return; }
      setError("");
      router.refresh();
    });
  }

  function handleDeleteInvoice() {
    if (!confirm(t.deleteDraftConfirm)) return;
    startTransition(async () => { await deleteInvoice(invoice.id); });
  }

  const computedTotal = invoice.items.reduce((sum, it) => sum + (it.unitCost ?? 0) * it.invoicedQty, 0);

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

      {invoice.notes && <p className="text-sm text-gray-600">{invoice.notes}</p>}

      {editable && <AddItemForm invoiceId={invoice.id} products={products} lang={lang} />}

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.colItem}</th>
              <th className="py-2 px-3 text-center">{t.colInvoicedQty}</th>
              {!editable && (
                <>
                  <th className="py-2 px-3 text-center">{t.colCounted}</th>
                  <th className="py-2 px-3 text-center">{t.colFinal}</th>
                  <th className="py-2 px-3 text-center">{t.colPlaced}</th>
                </>
              )}
              <th className="py-2 px-3 text-right">{t.colUnitCost}</th>
              <th className="py-2 px-3 text-right">{t.colLineTotal}</th>
              {editable && <th className="py-2 px-3 text-right">{commonDict[lang].actions}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">{t.noLineItemsYet}</td>
              </tr>
            ) : (
              invoice.items.map((it) => <ItemRow key={it.id} item={it} editable={editable} lang={lang} />)
            )}
          </tbody>
          {invoice.items.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-100">
                <td colSpan={editable ? 4 : 6} className="py-2 px-3 text-right text-sm font-medium text-gray-600">
                  {commonDict[lang].total}
                </td>
                <td className="py-2 px-3 text-right text-sm font-semibold">
                  {formatMoney(invoice.totalAmount ?? computedTotal)}
                </td>
                {editable && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {editable && (
        <div className="flex gap-3">
          <button onClick={handleSubmitInvoice} disabled={isPending} className="btn-primary text-sm px-4 py-2">
            {isPending ? t.submittingLabel : t.submitForCountingBtn}
          </button>
          <button onClick={handleDeleteInvoice} disabled={isPending} className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
            {t.deleteDraftBtn}
          </button>
        </div>
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
