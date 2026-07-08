import { prisma as db } from "@/lib/db";
import { CreateStaffRoleForm, ToggleStaffRoleButton } from "./StaffRoleActions";

export const dynamic = "force-dynamic";

export default async function StaffRolesPage() {
  const roles = await db.staffRole.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">Staff Roles</h1>
      <p className="text-sm text-gray-500">
        Staff roles group employees for HR purposes (e.g. Cashier, Storeman) and map to system permissions.
      </p>

      <CreateStaffRoleForm />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Permissions</th>
              <th className="px-4 py-2 text-left">Employees</th>
              <th className="px-4 py-2 text-left">Status</th>
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
                    {r.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <ToggleStaffRoleButton id={r.id} isActive={r.isActive} />
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No staff roles yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
