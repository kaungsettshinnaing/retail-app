import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";

const TABS: TabDef[] = [
  { href: "/hr/employees",  label: "Employees" },
  { href: "/hr/attendance", label: "Attendance" },
  { href: "/hr/leave",      label: "Leave" },
  { href: "/hr/advances",   label: "Advances" },
  { href: "/hr/fines",      label: "Fines" },
  { href: "/hr/payroll",    label: "Payroll" },
];

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["ADMIN", "MANAGER", "HR"]);
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <TabNav tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
