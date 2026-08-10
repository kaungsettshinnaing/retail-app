import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { reportsDict } from "@/lib/i18n/dict/reports";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["ADMIN", "MANAGER"]);
  const t = reportsDict[user.language];
  const TABS: TabDef[] = [
    { href: "/reports/pl",        label: t.tabPL },
    { href: "/reports/sales",     label: t.tabSales },
    { href: "/reports/inventory", label: t.tabInventory },
    { href: "/reports/payroll",   label: t.tabPayroll },
    { href: "/reports/journal",   label: t.tabJournal },
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
