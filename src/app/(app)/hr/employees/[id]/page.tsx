import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import EmployeeActiveToggle from "./EmployeeActiveToggle";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const emp = await db.employee.findUnique({
    where: { userId: id },
    include: {
      user: { select: { name: true, username: true, roles: true } },
      staffRole: { select: { name: true } },
    },
  });
  if (!emp) notFound();

  const fields: [string, string][] = [
    ["Employee No.", emp.employeeNo ?? "—"],
    ["Username", emp.user.username],
    ["Staff Role", emp.staffRole?.name ?? "—"],
    ["Permissions", emp.user.roles.join(", ") || "—"],
    ["Status", emp.isActive ? "Active" : "Inactive"],
    ["Start Date", formatDate(emp.startDate)],
    ["Date of Birth", formatDate(emp.dateOfBirth)],
    ["Phone", emp.phone ?? "—"],
    ["Address", emp.address ?? "—"],
    ["Emergency Contact", emp.emergencyContact ?? "—"],
    ["Bank Account", emp.bankAccount ?? "—"],
    ["Basic Salary", formatMoney(emp.basicSalary)],
    ["Attendance Bonus", formatMoney(emp.attendanceBonus)],
    ["Rest Days", emp.restDays.map((d) => DAYS[d]).join(", ") || "—"],
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{emp.user.name}</h1>
        <div className="flex gap-2">
          <Link href={`/hr/employees/${emp.userId}/edit`} className="btn-outline text-sm px-4 py-2">Edit</Link>
          <EmployeeActiveToggle userId={emp.userId} isActive={emp.isActive} />
        </div>
      </div>

      <div className="card">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {fields.map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-gray-400">{label}</div>
              <div className="font-medium text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
