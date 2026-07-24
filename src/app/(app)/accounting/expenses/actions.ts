"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import type { ActionResult } from "@/lib/action-result";
import type { PaymentMethod } from "@prisma/client";
import { postExpenseEntry } from "@/lib/journal-postings";

async function guard() {
  return requireAnyRole(["MANAGER", "ADMIN"]);
}

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const session = await guard();

  const categoryId = String(formData.get("categoryId") || "");
  const amountRaw = formData.get("amount");
  const description = String(formData.get("description") || "").trim();
  const dateRaw = String(formData.get("date") || "");
  const supplierId = String(formData.get("supplierId") || "") || undefined;
  const paymentMethod = String(formData.get("paymentMethod") || "") as PaymentMethod;

  if (!categoryId) return { ok: false, error: "Select a category" };
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount" };
  if (!description) return { ok: false, error: "Enter a description" };
  const date = new Date(`${dateRaw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Invalid date" };
  if (!["CASH", "TRANSFER", "COD"].includes(paymentMethod)) return { ok: false, error: "Select a payment method" };

  const category = await db.expenseCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { ok: false, error: "Category not found" };

  let receiptUrl: string | undefined;
  const receiptFile = formData.get("receipt") as File | null;
  if (receiptFile && receiptFile.size > 0) {
    try {
      const result = await saveUpload(receiptFile, "receipts");
      receiptUrl = result.path;
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : "Upload failed" };
    }
  }

  await db.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        categoryId,
        supplierId,
        amount: Math.round(amount),
        description,
        date,
        paymentMethod,
        receiptUrl,
        recordedById: session.id,
      },
    });
    await postExpenseEntry(tx, expense);

    if (paymentMethod === "CASH") {
      await tx.cashEntry.create({
        data: {
          type: "OUT",
          amount: expense.amount,
          description: `Expense: ${expense.description}`,
          source: "EXPENSE",
          referenceId: expense.id,
          expenseId: expense.id,
          date,
          recordedById: session.id,
        },
      });
    }
  });

  revalidatePath("/accounting/expenses");
  revalidatePath("/accounting/cash");
  return { ok: true };
}

export async function createExpenseCategory(name: string): Promise<ActionResult> {
  await guard();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Enter a category name" };

  const existing = await db.expenseCategory.findUnique({ where: { name: trimmed } });
  if (existing) return { ok: false, error: "A category with this name already exists" };

  const last = await db.expenseCategory.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  await db.expenseCategory.create({ data: { name: trimmed, sortOrder: (last?.sortOrder ?? 0) + 1 } });

  revalidatePath("/accounting/expenses");
  return { ok: true };
}

export async function renameExpenseCategory(id: string, name: string): Promise<ActionResult> {
  await guard();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Enter a category name" };

  const category = await db.expenseCategory.findUnique({ where: { id } });
  if (!category) return { ok: false, error: "Category not found" };

  await db.expenseCategory.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/accounting/expenses");
  return { ok: true };
}

export async function toggleExpenseCategory(id: string, isActive: boolean): Promise<ActionResult> {
  await guard();
  const category = await db.expenseCategory.findUnique({ where: { id } });
  if (!category) return { ok: false, error: "Category not found" };

  await db.expenseCategory.update({ where: { id }, data: { isActive } });
  revalidatePath("/accounting/expenses");
  return { ok: true };
}
