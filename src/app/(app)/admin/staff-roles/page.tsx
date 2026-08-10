import { prisma as db } from "@/lib/db";
import { CreateStaffRoleForm, ToggleStaffRoleButton } from "./StaffRoleActions";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

export default async function StaffRolesPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  const c = commonDict[user.language];
  const roles = await db.staffRole.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.staffRoleTitle}</h1>
      <p className="text-sm text-gray-500">
        {t.staffRoleDescription}
      </p>

      <CreateStaffRoleForm lang={user.language} />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">{c.name}</th>
              <th className="px-4 py-2 text-left">{t.staffRoleColPermissions}</th>
              <th className="px-4 py-2 text-left">{t.staffRoleColEmployees}</th>
              <th className="px-4 py-2 text-left">{c.status}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {roles.map((r) => (
              <tr key={r.id} className={r.isActive ? "" : "opacity-60"}>
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2 text-gray-500">{r.permissions.join(", ") || "—"}</td>
                <td className="px-4 py-2 text-gray-500">{r._count.employees}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {r.isActive ? c.active : c.inactive}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <ToggleStaffRoleButton id={r.id} isActive={r.isActive} lang={user.language} />
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">{t.staffRoleEmpty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
