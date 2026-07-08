import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "active" } = await searchParams;

  const employees = await db.employee.findMany({
    where: { isActive: tab !== "inactive" },
    include: {
      user: { select: { name: true, username: true, roles: true } },
      staffRole: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Employees</h1>
        <Link href="/hr/employees/new" className="btn-primary text-sm">+ New Employee</Link>
      </div>

      <div className="flex gap-2">
        <Link
          href="/hr/employees?tab=active"
          className={`badge ${tab !== "inactive" ? "bg-brand-light text-brand" : "bg-gray-100 text-gray-500"}`}
        >
          Active
        </Link>
        <Link
          href="/hr/employees?tab=inactive"
          className={`badge ${tab === "inactive" ? "bg-brand-light text-brand" : "bg-gray-100 text-gray-500"}`}
        >
          Inactive
        </Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Staff Role</th>
              <th className="py-2 px-3 text-left">Phone</th>
              <th className="py-2 px-3 text-right">Basic Salary</th>
              <th className="py-2 px-3 text-left">Rest Days</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No {tab === "inactive" ? "inactive" : "active"} employees.
                </td>
              </tr>
            )}
            {employees.map((e) => (
              <tr key={e.userId} className="hover:bg-gray-50">
                <td className="py-2.5 px-3 font-medium text-gray-900">
                  {e.user.name}
                  {e.employeeNo && <span className="ml-2 text-xs text-gray-400">{e.employeeNo}</span>}
                </td>
                <td className="py-2.5 px-3 text-gray-500">{e.staffRole?.name ?? "—"}</td>
                <td className="py-2.5 px-3 text-gray-500">{e.phone ?? "—"}</td>
                <td className="py-2.5 px-3 text-right text-gray-700">{formatMoney(e.basicSalary)}</td>
                <td className="py-2.5 px-3 text-gray-500">
                  {e.restDays.map((d) => DAY[d]).join(", ") || "—"}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Link href={`/hr/employees/${e.userId}`} className="text-xs text-brand hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
