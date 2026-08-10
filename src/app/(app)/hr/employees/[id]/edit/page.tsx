import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { updateEmployee } from "../../actions";
import SubmitButton from "@/components/SubmitButton";
import { requireSession } from "@/lib/auth";
import { hrDict } from "@/lib/i18n/dict/hr";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toInputDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();
  const t = hrDict[user.language];
  const c = commonDict[user.language];

  const [emp, staffRoles] = await Promise.all([
    db.employee.findUnique({
      where: { userId: id },
      include: { user: { select: { name: true, username: true } } },
    }),
    db.staffRole.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!emp) notFound();

  const action = updateEmployee.bind(null, emp.userId);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{t.editPrefix} {emp.user.name}</h1>
        <Link href={`/hr/employees/${emp.userId}`} className="text-sm text-brand hover:underline">{c.cancel}</Link>
      </div>

      <form action={action} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.staffRoleLabel}</label>
          <select name="staffRoleId" defaultValue={emp.staffRoleId ?? ""} className="input w-full">
            <option value="">{t.noneOption}</option>
            {staffRoles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.employeeNoLabel}</label>
            <input name="employeeNo" defaultValue={emp.employeeNo ?? ""} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.startDateRequiredLabel}</label>
            <input name="startDate" type="date" required defaultValue={toInputDate(emp.startDate)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateOfBirthLabel}</label>
            <input name="dateOfBirth" type="date" defaultValue={toInputDate(emp.dateOfBirth)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneLabel}</label>
            <input name="phone" defaultValue={emp.phone ?? ""} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.basicSalaryMmkLabel}</label>
            <input name="basicSalary" type="number" min="0" defaultValue={emp.basicSalary} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.attendanceBonusMmkLabel}</label>
            <input name="attendanceBonus" type="number" min="0" defaultValue={emp.attendanceBonus} className="input w-full" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.addressLabel}</label>
          <input name="address" defaultValue={emp.address ?? ""} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.emergencyContactLabel}</label>
          <input name="emergencyContact" defaultValue={emp.emergencyContact ?? ""} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.bankAccountLabel}</label>
          <input name="bankAccount" defaultValue={emp.bankAccount ?? ""} className="input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.restDaysLabel}</label>
          <div className="flex flex-wrap gap-3 pt-1">
            {DAYS.map((d, i) => (
              <label key={i} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="restDays" value={i} defaultChecked={emp.restDays.includes(i)} />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton className="btn-primary" pendingText={c.saving}>{t.saveChangesBtn}</SubmitButton>
          <Link href={`/hr/employees/${emp.userId}`} className="btn-outline text-sm px-4 py-2 text-center">{c.cancel}</Link>
        </div>
      </form>
    </div>
  );
}
