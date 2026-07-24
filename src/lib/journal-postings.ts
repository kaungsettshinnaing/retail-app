import { Prisma, PrismaClient } from "@prisma/client";
import { getCoreAccount, getOrCreateExpenseAccount, postEntry } from "./journal";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Posted when an order is recognized as paid — POS sales post immediately
 * at creation; online orders post when a manager confirms the transfer
 * proof (or on delivery for COD). Covers both revenue and COGS atomically,
 * mirroring the existing stock-deduction transaction in createOrder.
 */
export async function postOrderPaid(
  tx: Tx,
  order: { id: string; subtotal: number; discount: number; total: number; paymentMethod: "CASH" | "TRANSFER" | "COD" | null },
  paidAt: Date,
  items: { unitCost: number | null; qty: number }[],
): Promise<void> {
  const [cash, bank, discounts, revenue, cogs, inventory] = await Promise.all([
    getCoreAccount(tx, "1000"),
    getCoreAccount(tx, "1020"),
    getCoreAccount(tx, "4900"),
    getCoreAccount(tx, "4000"),
    getCoreAccount(tx, "5000"),
    getCoreAccount(tx, "1030"),
  ]);

  // CASH and COD are both received in-hand at the counter (COD here means
  // "collected at pickup/delivery", not a deferred receivable) — only
  // TRANSFER goes to Bank.
  const debitAccount = order.paymentMethod === "TRANSFER" ? bank : cash;

  const lines = [
    { accountId: debitAccount, debit: order.total },
    { accountId: discounts, debit: order.discount },
    { accountId: revenue, credit: order.subtotal },
  ];

  await postEntry(tx, {
    date: paidAt,
    description: "Order sale",
    sourceType: "Order",
    sourceId: order.id,
    lines,
  });

  const cogsAmount = items.reduce((sum, i) => sum + (i.unitCost ?? 0) * i.qty, 0);
  if (cogsAmount > 0) {
    await postEntry(tx, {
      date: paidAt,
      description: "Cost of goods sold",
      sourceType: "Order.cogs",
      sourceId: order.id,
      lines: [
        { accountId: cogs, debit: cogsAmount },
        { accountId: inventory, credit: cogsAmount },
      ],
    });
  }
}

/** Posted when a supplier invoice is submitted with a finalized totalAmount (goods received). */
export async function postSupplierInvoiceReceived(
  tx: Tx,
  invoice: { id: string; totalAmount: number; invoiceDate: Date },
): Promise<void> {
  if (invoice.totalAmount <= 0) return;
  const [inventory, ap] = await Promise.all([getCoreAccount(tx, "1030"), getCoreAccount(tx, "2000")]);
  await postEntry(tx, {
    date: invoice.invoiceDate,
    description: "Supplier invoice received",
    sourceType: "SupplierInvoice",
    sourceId: invoice.id,
    lines: [
      { accountId: inventory, debit: invoice.totalAmount },
      { accountId: ap, credit: invoice.totalAmount },
    ],
  });
}

/** Posted when a supplier invoice is marked paid. */
export async function postSupplierInvoicePaid(
  tx: Tx,
  invoice: { id: string; totalAmount: number; paidAt: Date; paymentMethod: "CASH" | "TRANSFER" | "COD" | null },
): Promise<void> {
  if (invoice.totalAmount <= 0) return;
  const [ap, cash, bank] = await Promise.all([getCoreAccount(tx, "2000"), getCoreAccount(tx, "1000"), getCoreAccount(tx, "1020")]);
  await postEntry(tx, {
    date: invoice.paidAt,
    description: "Supplier invoice paid",
    sourceType: "SupplierInvoice.paid",
    sourceId: invoice.id,
    lines: [
      { accountId: ap, debit: invoice.totalAmount },
      { accountId: invoice.paymentMethod === "TRANSFER" ? bank : cash, credit: invoice.totalAmount },
    ],
  });
}

/** Posted when an expense is entered (no confirm/pay accrual lifecycle here — posts immediately). */
export async function postExpenseEntry(
  tx: Tx,
  expense: { id: string; amount: number; date: Date; description: string; categoryId: string; paymentMethod: "CASH" | "TRANSFER" | "COD" },
): Promise<void> {
  const [expenseAcct, cash, bank] = await Promise.all([
    getOrCreateExpenseAccount(tx, expense.categoryId),
    getCoreAccount(tx, "1000"),
    getCoreAccount(tx, "1020"),
  ]);
  await postEntry(tx, {
    date: expense.date,
    description: expense.description,
    sourceType: "Expense",
    sourceId: expense.id,
    lines: [
      { accountId: expenseAcct, debit: expense.amount },
      { accountId: expense.paymentMethod === "TRANSFER" ? bank : cash, credit: expense.amount },
    ],
  });
}

/** Posted when a salary advance is given to an employee. */
export async function postAdvanceGiven(
  tx: Tx,
  advance: { id: string; totalAmount: number; createdAt: Date },
): Promise<void> {
  const [advReceivable, cash] = await Promise.all([getCoreAccount(tx, "2100"), getCoreAccount(tx, "1000")]);
  await postEntry(tx, {
    date: advance.createdAt,
    description: "Salary advance given",
    sourceType: "SalaryAdvance",
    sourceId: advance.id,
    lines: [
      { accountId: advReceivable, debit: advance.totalAmount },
      { accountId: cash, credit: advance.totalAmount },
    ],
  });
}

/** Posted once per employee when payroll for a month is locked. */
export async function postPayrollItem(
  tx: Tx,
  item: { id: string; netPay: number; advanceDeduction: number; fineDeduction: number },
  lockedAt: Date,
): Promise<void> {
  const gross = item.netPay + item.advanceDeduction + item.fineDeduction;
  if (gross <= 0) return;
  const [wages, advReceivable, finesRecovered, bank] = await Promise.all([
    getCoreAccount(tx, "6000"),
    getCoreAccount(tx, "2100"),
    getCoreAccount(tx, "6010"),
    getCoreAccount(tx, "1020"),
  ]);
  await postEntry(tx, {
    date: lockedAt,
    description: "Payroll — salary paid",
    sourceType: "PayrollItem",
    sourceId: item.id,
    lines: [
      { accountId: wages, debit: gross },
      { accountId: advReceivable, credit: item.advanceDeduction },
      { accountId: finesRecovered, credit: item.fineDeduction },
      { accountId: bank, credit: item.netPay },
    ],
  });
}
