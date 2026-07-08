import { prisma as db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import ExpenseForm from "./ExpenseForm";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; from?: string; to?: string }>;
}) {
  const { categoryId, from, to } = await searchParams;

  const where: {
    categoryId?: string;
    date?: { gte?: Date; lte?: Date };
  } = {};
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const [categories, expenses] = await Promise.all([
    db.expenseCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: { category: { select: { name: true } }, recordedBy: { select: { name: true } } },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="section-title">Expenses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ExpenseForm categories={categories.filter((c) => c.isActive)} suppliers={[]} />

          <form className="flex flex-wrap items-end gap-2" method="get">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Category</label>
              <select name="categoryId" defaultValue={categoryId ?? ""} className="input">
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">From</label>
              <input type="date" name="from" defaultValue={from ?? ""} className="input" />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">To</label>
              <input type="date" name="to" defaultValue={to ?? ""} className="input" />
            </div>
            <button type="submit" className="btn-outline">
              Filter
            </button>
          </form>

          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-left">Description</th>
                  <th className="py-2 px-3 text-left">Recorded By</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                      No expenses found.
                    </td>
                  </tr>
                )}
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 px-3 text-sm text-gray-500">{formatDate(e.date)}</td>
                    <td className="py-2 px-3 text-sm text-gray-600">{e.category.name}</td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {e.description}
                      {e.receiptUrl && (
                        <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs text-brand hover:underline">
                          Receipt
                        </a>
                      )}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">{e.recordedBy.name}</td>
                    <td className="py-2 px-3 text-sm text-right text-red-700">{formatMoney(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <CategoryManager categories={categories} />
        </div>
      </div>
    </div>
  );
}
