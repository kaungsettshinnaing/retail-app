import { prisma } from "@/lib/db";
import IssuePortalAccessForm from "@/components/b2b/IssuePortalAccessForm";
import { requireSession } from "@/lib/auth";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

export default async function B2BCustomersPage() {
  const user = await requireSession();
  const t = b2bDict[user.language];
  const c = commonDict[user.language];
  const customers = await prisma.customer.findMany({
    where: { isB2B: true },
    include: { sourceLead: { select: { id: true, businessName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.b2bCustomersTitle}</h1>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.colName}</th>
              <th className="py-2 px-3 text-left">{t.colPhone}</th>
              <th className="py-2 px-3 text-left">{t.colAddress}</th>
              <th className="py-2 px-3 text-left">{t.colSourceLead}</th>
              <th className="py-2 px-3 text-left">{t.colStatus}</th>
              <th className="py-2 px-3 text-left">{t.colPortalAccess}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">{t.noCustomersYet}</td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr key={cust.id} className={`hover:bg-gray-50 ${!cust.isActive ? "opacity-50" : ""}`}>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{cust.name ?? "—"}</td>
                  <td className="py-2.5 px-3 text-gray-500">{cust.phone ?? "—"}</td>
                  <td className="py-2.5 px-3 text-gray-500">{cust.address ?? "—"}</td>
                  <td className="py-2.5 px-3 text-gray-500">{cust.sourceLead?.businessName ?? "—"}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${cust.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {cust.isActive ? c.active : c.inactive}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {cust.email ? (
                      <span className="text-xs text-gray-500">{cust.email}</span>
                    ) : (
                      <IssuePortalAccessForm customerId={cust.id} lang={user.language} />
                    )}
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
