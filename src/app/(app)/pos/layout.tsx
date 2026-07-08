import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";

const TABS: TabDef[] = [
  { href: "/pos",          label: "New Sale" },
  { href: "/pos/invoices", label: "Supplier Invoices" },
];

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["CASHIER", "MANAGER", "ADMIN"]);
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <TabNav tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
