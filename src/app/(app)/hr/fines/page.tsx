import { prisma as db } from "@/lib/db";
import { CreateFineForm, DeleteFineButton } from "./FineActions";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function FinesPage() {
  const [employees, fines] = await Promise.all([
    db.employee.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    db.employeeFine.findMany({
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="section-title">Employee Fines</h1>

      <CreateFineForm employees={employees.map((e) => ({ userId: e.userId, name: e.user.name }))} />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Deduct In</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fines.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-2">{f.employee.user.name}</td>
                <td className="px-4 py-2">{f.amount.toLocaleString()} MMK</td>
                <td className="px-4 py-2 text-gray-500">{f.reason}</td>
                <td className="px-4 py-2 text-gray-500">{MONTHS[f.deductMonth - 1]} {f.deductYear}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${f.deducted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {f.deducted ? "Deducted" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-2">{!f.deducted && <DeleteFineButton id={f.id} />}</td>
              </tr>
            ))}
            {fines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No fines recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
