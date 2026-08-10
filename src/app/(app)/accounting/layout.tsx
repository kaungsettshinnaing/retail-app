import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { accountingDict } from "@/lib/i18n/dict/accounting";

export default async function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["MANAGER", "ADMIN"]);
  const t = accountingDict[user.language];
  const TABS: TabDef[] = [
    { href: "/accounting/cash",       label: t.tabCashLedger },
    { href: "/accounting/payable",    label: t.tabPayable },
    { href: "/accounting/receivable", label: t.tabReceivable },
    { href: "/accounting/expenses",   label: t.tabExpenses },
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
