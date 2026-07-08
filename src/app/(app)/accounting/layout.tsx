import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";

const TABS: TabDef[] = [
  { href: "/accounting/cash",       label: "Cash Ledger" },
  { href: "/accounting/payable",    label: "Payable" },
  { href: "/accounting/receivable", label: "Receivable" },
  { href: "/accounting/expenses",   label: "Expenses" },
];

export default async function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["MANAGER", "ADMIN"]);
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <TabNav tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
