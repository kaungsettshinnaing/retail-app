import { prisma as db } from "@/lib/db";
import { CreateAdvanceForm, DeleteInstalmentButton } from "./AdvanceActions";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function AdvancesPage() {
  const [employees, instalments] = await Promise.all([
    db.employee.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    db.advanceInstalment.findMany({
      include: {
        advance: {
          include: { employee: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="section-title">Salary Advances</h1>

      <CreateAdvanceForm employees={employees.map((e) => ({ userId: e.userId, name: e.user.name }))} />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Note</th>
              <th className="px-4 py-2 text-left">Deduct In</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {instalments.map((inst) => (
              <tr key={inst.id}>
                <td className="px-4 py-2 font-medium">{inst.advance.employee.user.name}</td>
                <td className="px-4 py-2">{inst.amount.toLocaleString()} MMK</td>
                <td className="px-4 py-2 text-gray-500">{inst.advance.note ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">{MONTHS[inst.month - 1]} {inst.year}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${inst.deducted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {inst.deducted ? "Deducted" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-2">{!inst.deducted && <DeleteInstalmentButton id={inst.id} />}</td>
              </tr>
            ))}
            {instalments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No advances recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
