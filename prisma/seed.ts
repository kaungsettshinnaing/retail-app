import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  // Admin user
  const adminHash = bcrypt.hashSync("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrator",
      passwordHash: adminHash,
      roles: ["ADMIN"],
      isActive: true,
      isSystemAccount: true,
    },
  });

  // Default settings
  const defaults = [
    { key: "storeName",    valueJson: "Retail Store" },
    { key: "currency",     valueJson: "MMK" },
    { key: "storePhone",   valueJson: "" },
    { key: "storeAddress", valueJson: "" },
  ];
  for (const s of defaults) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // Default expense categories
  const expenseCategories = ["Rent", "Utilities", "Transport", "Packaging", "Maintenance", "Other"];
  for (let i = 0; i < expenseCategories.length; i++) {
    await prisma.expenseCategory.upsert({
      where: { name: expenseCategories[i] },
      update: {},
      create: { name: expenseCategories[i], sortOrder: i },
    });
  }

  // Default shifts
  const shifts = [
    { name: "Morning",   startTime: "08:00", endTime: "16:00" },
    { name: "Afternoon", startTime: "13:00", endTime: "21:00" },
    { name: "Night",     startTime: "21:00", endTime: "05:00" },
  ];
  for (const s of shifts) {
    await prisma.shift.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  console.log("Seed complete. Admin login: admin / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
