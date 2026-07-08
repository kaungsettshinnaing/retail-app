import { prisma as db } from "@/lib/db";
import WarehouseEditor from "./WarehouseEditor";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
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
      <h1 className="section-title">Warehouse Layout</h1>
      <p className="text-sm text-gray-500">
        Define storage areas, optional shelves within an area, and sections (the actual locations stock is stored at).
      </p>
      <WarehouseEditor areas={areas} />
    </div>
  );
}
