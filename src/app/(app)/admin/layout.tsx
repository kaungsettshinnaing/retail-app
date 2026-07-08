import { requireAnyRole } from "@/lib/auth";
import TabNav from "@/components/TabNav";
import type { TabDef } from "@/components/TabNav";

const TABS: TabDef[] = [
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products",   label: "Products" },
  { href: "/admin/suppliers",  label: "Suppliers" },
  { href: "/admin/warehouse",  label: "Warehouse" },
  { href: "/admin/users",      label: "Users" },
  { href: "/admin/settings",   label: "Settings" },
];

export default async function AdminLayout({
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
