import { prisma as db } from "@/lib/db";
import WarehouseEditor from "./WarehouseEditor";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  const areas = await db.warehouseArea.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      shelves: {
        orderBy: { sortOrder: "asc" },
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
        },
      },
      sections: {
        where: { shelfId: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.warehouseTitle}</h1>
      <p className="text-sm text-gray-500">
        {t.warehouseDescription}
      </p>
      <WarehouseEditor areas={areas} lang={user.language} />
    </div>
  );
}
