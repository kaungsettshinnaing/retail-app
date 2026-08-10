import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";
import { adminDict } from "@/lib/i18n/dict/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["ADMIN", "MANAGER"]);
  const t = adminDict[user.language];

  const TABS: TabDef[] = [
    { href: "/admin/categories", label: t.navCategories },
    { href: "/admin/products",   label: t.navProducts },
    { href: "/admin/suppliers",  label: t.navSuppliers },
    { href: "/admin/warehouse",  label: t.navWarehouse },
    { href: "/admin/users",      label: t.navUsers },
    { href: "/admin/staff-roles",label: t.navStaffRoles },
    { href: "/admin/settings",   label: t.navSettings },
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
