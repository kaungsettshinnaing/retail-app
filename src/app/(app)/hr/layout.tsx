import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { hrDict } from "@/lib/i18n/dict/hr";

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["ADMIN", "MANAGER", "HR"]);
  const t = hrDict[user.language];

  const TABS: TabDef[] = [
    { href: "/hr/employees",  label: t.tabEmployees },
    { href: "/hr/attendance", label: t.tabAttendance },
    { href: "/hr/leave",      label: t.tabLeave },
    { href: "/hr/advances",   label: t.tabAdvances },
    { href: "/hr/fines",      label: t.tabFines },
    { href: "/hr/payroll",    label: t.tabPayroll },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <TabNav tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
