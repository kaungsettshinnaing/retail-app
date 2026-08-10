import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { posDict } from "@/lib/i18n/dict/pos";

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["CASHIER", "MANAGER", "ADMIN"]);
  const t = posDict[user.language];

  const TABS: TabDef[] = [
    { href: "/pos",           label: t.tabNewSale },
    { href: "/pos/invoices",  label: t.tabSupplierInvoices },
    { href: "/pos/inquiries", label: t.tabPriceInquiries },
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
