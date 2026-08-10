import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  const c = commonDict[user.language];
  const suppliers = await db.supplier.findMany({
    include: { _count: { select: { invoices: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{t.supplierTitle}</h1>
        <Link href="/admin/suppliers/new" className="btn-primary text-sm">+ {t.supplierNewButton}</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{c.name}</th>
              <th className="py-2 px-3 text-left">{t.supplierColContact}</th>
              <th className="py-2 px-3 text-left">{t.supplierColPhone}</th>
              <th className="py-2 px-3 text-center">{t.supplierColInvoices}</th>
              <th className="py-2 px-3 text-left">{c.status}</th>
              <th className="py-2 px-3 text-right">{c.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">{t.supplierEmpty}</td>
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
                      {s.isActive ? c.active : c.inactive}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link href={`/admin/suppliers/${s.id}`} className="text-xs text-brand hover:underline">
                      {c.edit}
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
