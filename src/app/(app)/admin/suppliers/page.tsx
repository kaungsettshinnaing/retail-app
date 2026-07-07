import Link from "next/link";
import { prisma as db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await db.supplier.findMany({
    include: { _count: { select: { invoices: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Suppliers</h1>
        <Link href="/admin/suppliers/new" className="btn-primary text-sm">+ New Supplier</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Contact</th>
              <th className="py-2 px-3 text-left">Phone</th>
              <th className="py-2 px-3 text-center">Invoices</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">No suppliers yet.</td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className={`hover:bg-gray-50 ${!s.isActive ? "opacity-50" : ""}`}>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{s.name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{s.contact ?? "—"}</td>
                  <td className="py-2.5 px-3 text-gray-500">{s.phone ?? "—"}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{s._count.invoices}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link href={`/admin/suppliers/${s.id}`} className="text-xs text-brand hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
