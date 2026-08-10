import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import EmployeeActiveToggle from "./EmployeeActiveToggle";
import { requireSession } from "@/lib/auth";
import { hrDict } from "@/lib/i18n/dict/hr";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();
  const t = hrDict[user.language];
  const c = commonDict[user.language];

  const emp = await db.employee.findUnique({
    where: { userId: id },
    include: {
      user: { select: { name: true, username: true, roles: true } },
      staffRole: { select: { name: true } },
    },
  });
  if (!emp) notFound();

  const fields: [string, string][] = [
    [t.employeeNoLabel, emp.employeeNo ?? "—"],
    [t.usernameField, emp.user.username],
    [t.staffRoleLabel, emp.staffRole?.name ?? "—"],
    [t.permissionsField, emp.user.roles.join(", ") || "—"],
    [c.status, emp.isActive ? c.active : c.inactive],
    [t.startDateLabel, formatDate(emp.startDate)],
    [t.dateOfBirthLabel, formatDate(emp.dateOfBirth)],
    [t.phoneLabel, emp.phone ?? "—"],
    [t.addressLabel, emp.address ?? "—"],
    [t.emergencyContactLabel, emp.emergencyContact ?? "—"],
    [t.bankAccountLabel, emp.bankAccount ?? "—"],
    [t.basicSalaryLabel, formatMoney(emp.basicSalary)],
    [t.attendanceBonusLabel, formatMoney(emp.attendanceBonus)],
    [t.restDaysLabel, emp.restDays.map((d) => DAYS[d]).join(", ") || "—"],
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{emp.user.name}</h1>
        <div className="flex gap-2">
          <Link href={`/hr/employees/${emp.userId}/edit`} className="btn-outline text-sm px-4 py-2">{c.edit}</Link>
          <EmployeeActiveToggle userId={emp.userId} isActive={emp.isActive} lang={user.language} />
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
