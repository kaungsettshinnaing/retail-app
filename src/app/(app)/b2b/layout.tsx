import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { b2bDict } from "@/lib/i18n/dict/b2b";

export default async function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["BD_REP", "BD_LEAD", "MANAGER", "ADMIN"]);
  const t = b2bDict[user.language];

  const TABS: TabDef[] = [
    { href: "/b2b",            label: t.tabPipeline },
    { href: "/b2b/dashboard",  label: t.tabDashboard },
    { href: "/b2b/customers",  label: t.tabCustomers },
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
