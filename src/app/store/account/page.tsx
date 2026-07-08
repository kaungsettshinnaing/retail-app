import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PICKING: "bg-amber-100 text-amber-700",
  PACKED: "bg-purple-100 text-purple-700",
  READY: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  PICKED_UP: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/store/account/login");

  const customer = await db.customer.findUnique({ where: { id: session.id } });
  if (!customer) redirect("/store/account/login");

  const orders = await db.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true } } },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="section-title">My Account</h1>
        <LogoutButton />
      </div>

      <div className="card text-sm text-gray-600 space-y-1">
        <p>Name: <strong>{customer.name}</strong></p>
        <p>Email: {customer.email}</p>
        {customer.phone && <p>Phone: {customer.phone}</p>}
        {customer.address && <p>Address: {customer.address}</p>}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Order History</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-3 text-left">Order</th>
                <th className="py-2 px-3 text-left">Placed</th>
                <th className="py-2 px-3 text-center">Items</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-800">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="py-2 px-3 text-sm text-gray-500">{formatDateTime(o.createdAt)}</td>
                  <td className="py-2 px-3 text-sm text-center text-gray-500">{o.items.length}</td>
                  <td className="py-2 px-3 text-sm text-right">{formatMoney(o.total)}</td>
                  <td className="py-2 px-3">
                    <span className={`badge ${STATUS_STYLES[o.status] ?? ""}`}>{o.status}</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Link href={`/store/orders/${o.id}`} className="text-sm text-brand hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
