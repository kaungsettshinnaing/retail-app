import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { createEmployee } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
      ? "This user already has an employee record."
      : error === "missing"
      ? "Please select a staff user."
      : null;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">New Employee</h1>
        <Link href="/hr/employees" className="text-sm text-brand hover:underline">Back to Employees</Link>
      </div>

      {errorMsg && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{errorMsg}</div>
      )}

      <form action={createEmployee} className="card space-y-4">
        {eligibleUsers.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            No staff users are available to onboard.{" "}
            <Link href="/admin/users/new" className="underline font-medium">Create a staff user</Link> first.
          </p>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff User *</label>
            <select name="userId" required className="input w-full">
              <option value="">Select a user…</option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.username}) — {u.roles.join(", ") || "no roles"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Role</label>
          <select name="staffRoleId" className="input w-full">
            <option value="">— None —</option>
            {staffRoles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee No.</label>
            <input name="employeeNo" className="input w-full" placeholder="EMP001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input name="startDate" type="date" required className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input name="dateOfBirth" type="date" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (MMK)</label>
            <input name="basicSalary" type="number" min="0" className="input w-full" defaultValue="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Bonus (MMK)</label>
            <input name="attendanceBonus" type="number" min="0" className="input w-full" defaultValue="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input name="emergencyContact" className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
          <input name="bankAccount" className="input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rest Days</label>
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
          <SubmitButton className="btn-primary" pendingText="Creating…">Create Employee</SubmitButton>
          <Link href="/hr/employees" className="btn-outline text-sm px-4 py-2 text-center">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
