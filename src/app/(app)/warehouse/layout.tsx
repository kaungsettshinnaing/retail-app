import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { warehouseDict } from "@/lib/i18n/dict/warehouse";

export default async function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["STOREMAN", "MANAGER", "ADMIN"]);
  const t = warehouseDict[user.language];

  const TABS: TabDef[] = [
    { href: "/warehouse/invoices", label: t.tabIncomingInvoices },
    { href: "/warehouse/orders",   label: t.tabFulfilment },
    { href: "/warehouse/stock",    label: t.tabStock },
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
