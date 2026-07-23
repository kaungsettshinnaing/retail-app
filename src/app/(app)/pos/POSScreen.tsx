"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { submitPosOrder } from "./actions";
import type { PaymentMethod } from "@prisma/client";

type Variant = {
  id: string;
  sku: string;
  optionValues: unknown;
  price: number | null;
  stock: number;
};
type Product = {
  id: string;
  name: string;
  type: "REGULAR" | "PASS_THROUGH" | "CONTACT_PRICE";
  unit: string;
  variants: Variant[];
};
type CartLine = {
  key: string; // variantId
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  optionLabel: string;
  type: Product["type"];
  unitPrice: number;
  qty: number;
  maxStock: number | null; // null = unlimited (PASS_THROUGH)
};

function variantOptionLabel(optionValues: unknown): string {
  const opts = optionValues as Record<string, string> | null;
  return opts && Object.keys(opts).length ? Object.values(opts).join(" / ") : "";
}

type InitialLine = { productId: string; price: number } | null;

export default function POSScreen({ catalog, initialLine = null }: { catalog: Product[]; initialLine?: InitialLine }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<InitialLine>(initialLine);
  const router = useRouter();

  // Coming from a converted price inquiry: if the product has exactly one
  // variant, add it straight to the cart at the quoted price. Otherwise
  // surface the product via search and let addToCart prefill the prompt.
  useEffect(() => {
    if (!initialLine) return;
    const product = catalog.find((p) => p.id === initialLine.productId);
    if (!product) return;
    setSearch(product.name);
    if (product.variants.length === 1) {
      addToCart(product, product.variants[0], initialLine.price);
      setSuggestedPrice(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((p) => ({
        ...p,
        variants: p.variants.filter(
          (v) =>
            p.name.toLowerCase().includes(q) ||
            v.sku.toLowerCase().includes(q) ||
            variantOptionLabel(v.optionValues).toLowerCase().includes(q)
        ),
      }))
      .filter((p) => p.variants.length > 0);
  }, [search, catalog]);

  function addToCart(product: Product, variant: Variant, presetPrice?: number) {
    let unitPrice = variant.price;
    if (product.type === "CONTACT_PRICE") {
      if (presetPrice != null) {
        unitPrice = presetPrice;
      } else {
        const defaultValue =
          suggestedPrice?.productId === product.id ? String(suggestedPrice.price) : undefined;
        const input = prompt(`Enter agreed price for ${product.name} (${variant.sku}):`, defaultValue);
        if (input === null) return;
        const parsed = Number(input);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          alert("Enter a valid price");
          return;
        }
        unitPrice = parsed;
        if (suggestedPrice?.productId === product.id) setSuggestedPrice(null);
      }
    }
    if (unitPrice == null) {
      alert(`${product.name} has no price set`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.key === variant.id);
      if (existing) {
        return prev.map((l) => (l.key === variant.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          key: variant.id,
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          sku: variant.sku,
          optionLabel: variantOptionLabel(variant.optionValues),
          type: product.type,
          unitPrice: unitPrice!,
          qty: 1,
          maxStock: product.type === "REGULAR" ? variant.stock : null,
        },
      ];
    });
  }

  function updateQty(key: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.key !== key));
      return;
    }
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, qty } : l)));
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const total = Math.max(0, subtotal - discount);

  async function handleCheckout() {
    if (cart.length === 0) {
      setError("Add at least one item to the order");
      return;
    }
    for (const l of cart) {
      if (l.maxStock != null && l.qty > l.maxStock) {
        setError(`${l.productName} (${l.sku}) only has ${l.maxStock} in stock`);
        return;
      }
    }
    setSubmitting(true);
    setError("");
    const res = await submitPosOrder({
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      paymentMethod,
      discount,
      notes: notes || undefined,
      items: cart.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        qty: l.qty,
        unitPriceOverride: l.type === "CONTACT_PRICE" ? l.unitPrice : undefined,
      })),
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    router.push(`/pos/orders/${res.orderId}`);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        {suggestedPrice && (
          <div className="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            This product was quoted at {formatMoney(suggestedPrice.price)} — pick the variant below to add it at that price.
          </div>
        )}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product name or SKU…"
          className="input w-full"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 col-span-2 text-center py-8">No products match your search.</p>
          )}
          {filtered.flatMap((p) =>
            p.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => addToCart(p, v)}
                disabled={p.type === "REGULAR" && v.stock <= 0}
                className="card text-left hover:border-brand disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                {v.sku && <p className="text-xs text-gray-400">{v.sku}{variantOptionLabel(v.optionValues) ? ` — ${variantOptionLabel(v.optionValues)}` : ""}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-semibold text-brand">
                    {p.type === "CONTACT_PRICE" ? "Contact for Price" : v.price != null ? formatMoney(v.price) : "—"}
                  </span>
                  {p.type === "REGULAR" && (
                    <span className={`badge ${v.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {v.stock} {p.unit}
                    </span>
                  )}
                  {p.type === "PASS_THROUGH" && <span className="badge bg-blue-100 text-blue-700">On Demand</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="card space-y-3 h-fit">
        <h2 className="section-title">Cart</h2>
        {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Cart is empty</p>
          ) : (
            cart.map((l) => (
              <div key={l.key} className="flex items-center gap-2 text-sm border-b border-gray-50 pb-2">
                <div className="flex-1">
                  <p className="text-gray-800">{l.productName}</p>
                  <p className="text-xs text-gray-400">{l.sku}{l.optionLabel ? ` — ${l.optionLabel}` : ""}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={l.qty}
                  onChange={(e) => updateQty(l.key, Number(e.target.value))}
                  className="input w-16 text-xs text-center"
                />
                <span className="w-20 text-right text-xs text-gray-600">{formatMoney(l.unitPrice * l.qty)}</span>
                <button onClick={() => removeLine(l.key)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name (optional)" className="input w-full text-sm" />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone (optional)" className="input w-full text-sm" />
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="input w-full text-sm">
            <option value="CASH">Cash</option>
            <option value="TRANSFER">Bank Transfer</option>
            <option value="COD">Cash on Delivery</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Discount</label>
            <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="input flex-1 text-sm" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="input w-full text-sm" />
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Discount</span><span>-{formatMoney(discount)}</span></div>
          <div className="flex justify-between text-base font-semibold text-gray-800"><span>Total</span><span>{formatMoney(total)}</span></div>
        </div>

        <button onClick={handleCheckout} disabled={submitting} className="btn-primary w-full">
          {submitting ? "Processing…" : "Complete Sale"}
        </button>
      </div>
    </div>
  );
}
