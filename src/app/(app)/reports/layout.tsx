import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";

const TABS: TabDef[] = [
  { href: "/reports/pl",        label: "P&L" },
  { href: "/reports/sales",     label: "Sales" },
  { href: "/reports/inventory", label: "Inventory" },
  { href: "/reports/payroll",   label: "Payroll" },
];

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <TabNav tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
