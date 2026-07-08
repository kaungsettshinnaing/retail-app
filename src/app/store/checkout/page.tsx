"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/store/CartContext";
import { placeOnlineOrder } from "./actions";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TRANSFER">("COD");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  if (lines.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-16">Your cart is empty.</p>;
  }

  async function handlePlaceOrder() {
    setSubmitting(true);
    setError("");
    const res = await placeOnlineOrder({
      shippingAddress,
      paymentMethod,
      notes: notes || undefined,
      items: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        qty: l.qty,
        unitPriceOverride: l.productType === "CONTACT_PRICE" ? l.unitPrice : undefined,
      })),
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    clear();
    router.push(`/store/orders/${res.orderId}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="section-title">Checkout</h1>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="card space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Order Summary</h2>
        {lines.map((l) => (
          <div key={l.key} className="flex justify-between text-sm text-gray-600">
            <span>{l.productName} × {l.qty}</span>
            <span>{formatMoney(l.unitPrice * l.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between text-base font-semibold text-gray-800 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
      </div>

      <div className="card space-y-2">
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Shipping / pickup address"
          rows={2}
          className="input w-full text-sm"
        />
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "COD" | "TRANSFER")} className="input w-full text-sm">
          <option value="COD">Cash on Delivery</option>
          <option value="TRANSFER">Bank Transfer</option>
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="input w-full text-sm" />
      </div>

      <button onClick={handlePlaceOrder} disabled={submitting || !shippingAddress.trim()} className="btn-primary w-full">
        {submitting ? "Placing Order…" : "Place Order"}
      </button>
    </div>
  );
}
