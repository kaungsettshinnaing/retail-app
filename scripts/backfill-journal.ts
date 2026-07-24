/**
 * One-time backfill: walks every pre-existing historical record through the
 * same post*() functions used going forward, so the journal covers the
 * business's full history rather than only starting from when this feature
 * shipped. Safe to re-run — postEntry() is idempotent on (sourceType, sourceId).
 *
 * Run with: npx tsx scripts/backfill-journal.ts
 */
import { prisma } from "../src/lib/db";
import {
  postOrderPaid,
  postSupplierInvoiceReceived,
  postSupplierInvoicePaid,
  postExpenseEntry,
  postAdvanceGiven,
  postPayrollItem,
} from "../src/lib/journal-postings";

async function main() {
  // 1. Paid orders — revenue + COGS
  const orders = await prisma.order.findMany({
    where: { paidAt: { not: null }, status: { not: "CANCELLED" } },
    select: {
      id: true, subtotal: true, discount: true, total: true, paymentMethod: true, paidAt: true,
      items: { select: { unitCost: true, qty: true } },
    },
    orderBy: { paidAt: "asc" },
  });
  for (const o of orders) {
    if (!o.paidAt) continue;
    await postOrderPaid(prisma, o, o.paidAt, o.items);
  }
  console.log(`Posted ${orders.length} order-paid entries.`);

  // 2. Supplier invoices received (any status past DRAFT, with a finalized total)
  const invoices = await prisma.supplierInvoice.findMany({
    where: { status: { not: "DRAFT" }, totalAmount: { not: null } },
    select: { id: true, totalAmount: true, invoiceDate: true },
  });
  for (const inv of invoices) {
    await postSupplierInvoiceReceived(prisma, { id: inv.id, totalAmount: inv.totalAmount ?? 0, invoiceDate: inv.invoiceDate });
  }
  console.log(`Posted ${invoices.length} supplier-invoice-received entries.`);

  // 3. Supplier invoices paid
  const paidInvoices = await prisma.supplierInvoice.findMany({
    where: { paidAt: { not: null }, totalAmount: { not: null } },
    select: { id: true, totalAmount: true, paidAt: true, paymentMethod: true },
  });
  for (const inv of paidInvoices) {
    if (!inv.paidAt) continue;
    await postSupplierInvoicePaid(prisma, { id: inv.id, totalAmount: inv.totalAmount ?? 0, paidAt: inv.paidAt, paymentMethod: inv.paymentMethod });
  }
  console.log(`Posted ${paidInvoices.length} supplier-invoice-paid entries.`);

  // 4. Expenses (immediate recognition)
  const expenses = await prisma.expense.findMany({
    select: { id: true, amount: true, date: true, description: true, categoryId: true, paymentMethod: true },
  });
  for (const e of expenses) {
    await postExpenseEntry(prisma, e);
  }
  console.log(`Posted ${expenses.length} expense entries.`);

  // 5. Salary advances given
  const advances = await prisma.salaryAdvance.findMany({
    select: { id: true, totalAmount: true, createdAt: true },
  });
  for (const a of advances) {
    await postAdvanceGiven(prisma, a);
  }
  console.log(`Posted ${advances.length} salary-advance entries.`);

  // 6. Locked payroll items
  const lockedPayrolls = await prisma.payroll.findMany({
    where: { status: "LOCKED" },
    select: { lockedAt: true, items: { select: { id: true, netPay: true, advanceDeduction: true, fineDeduction: true } } },
  });
  let payrollItemCount = 0;
  for (const payroll of lockedPayrolls) {
    if (!payroll.lockedAt) continue;
    for (const item of payroll.items) {
      await postPayrollItem(prisma, item, payroll.lockedAt);
      payrollItemCount++;
    }
  }
  console.log(`Posted ${payrollItemCount} payroll-item entries.`);

  // Sanity check — the whole ledger must balance.
  const totals = await prisma.journalLine.aggregate({ _sum: { debit: true, credit: true } });
  const totalDebit = totals._sum.debit ?? 0;
  const totalCredit = totals._sum.credit ?? 0;
  console.log(`\nTotal debit: ${totalDebit}  Total credit: ${totalCredit}  Balanced: ${totalDebit === totalCredit}`);
  if (totalDebit !== totalCredit) {
    throw new Error("Journal is unbalanced after backfill — investigate before trusting these figures.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
