import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { createEmployee } from "../actions";
import SubmitButton from "@/components/SubmitButton";
import { requireSession } from "@/lib/auth";
import { hrDict } from "@/lib/i18n/dict/hr";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await requireSession();
  const t = hrDict[user.language];
  const c = commonDict[user.language];

  const [eligibleUsers, staffRoles] = await Promise.all([
    db.user.findMany({
      where: { isActive: true, isSystemAccount: false, employee: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true, roles: true },
    }),
    db.staffRole.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const errorMsg =
    error === "exists"
      ? t.errorUserExists
      : error === "missing"
      ? t.errorMissingUser
      : null;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{t.newEmployeeTitle}</h1>
        <Link href="/hr/employees" className="text-sm text-brand hover:underline">{t.backToEmployees}</Link>
      </div>

      {errorMsg && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{errorMsg}</div>
      )}

      <form action={createEmployee} className="card space-y-4">
        {eligibleUsers.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            {t.noEligibleUsers}{" "}
            <Link href="/admin/users/new" className="underline font-medium">{t.createStaffUserLink}</Link> {t.firstWord}.
          </p>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.staffUserRequiredLabel}</label>
            <select name="userId" required className="input w-full">
              <option value="">{t.selectUserPlaceholder}</option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.username}) — {u.roles.join(", ") || t.noRolesText}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.staffRoleLabel}</label>
          <select name="staffRoleId" className="input w-full">
            <option value="">{t.noneOption}</option>
            {staffRoles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.employeeNoLabel}</label>
            <input name="employeeNo" className="input w-full" placeholder={t.employeeNoPlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.startDateRequiredLabel}</label>
            <input name="startDate" type="date" required className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateOfBirthLabel}</label>
            <input name="dateOfBirth" type="date" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneLabel}</label>
            <input name="phone" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.basicSalaryMmkLabel}</label>
            <input name="basicSalary" type="number" min="0" className="input w-full" defaultValue="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.attendanceBonusMmkLabel}</label>
            <input name="attendanceBonus" type="number" min="0" className="input w-full" defaultValue="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.addressLabel}</label>
          <input name="address" className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.emergencyContactLabel}</label>
          <input name="emergencyContact" className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.bankAccountLabel}</label>
          <input name="bankAccount" className="input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.restDaysLabel}</label>
          <div className="flex flex-wrap gap-3 pt-1">
            {DAYS.map((d, i) => (
              <label key={i} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="restDays" value={i} />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton className="btn-primary" pendingText={t.creatingEllipsis}>{t.createEmployeeBtn}</SubmitButton>
          <Link href="/hr/employees" className="btn-outline text-sm px-4 py-2 text-center">{c.cancel}</Link>
        </div>
      </form>
    </div>
  );
}
