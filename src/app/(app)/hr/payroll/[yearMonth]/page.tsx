import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import PayrollActions from "./PayrollActions";
import { requireSession } from "@/lib/auth";
import { hrDict } from "@/lib/i18n/dict/hr";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function PayrollDetailPage({
  params,
}: {
  params: Promise<{ yearMonth: string }>;
}) {
  const { yearMonth } = await params;
  const user = await requireSession();
  const t = hrDict[user.language];
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const payroll = await db.payroll.findUnique({
    where: { month_year: { month, year } },
    include: {
      items: {
        include: { employee: { include: { user: { select: { name: true } } } } },
        orderBy: { employee: { user: { name: "asc" } } },
      },
      lockedBy: { select: { name: true } },
    },
  });

  const isLocked = payroll?.status === "LOCKED";
  const totalNet = payroll?.items.reduce((s, i) => s + i.netPay, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="section-title">{t.payrollDetailPrefix} {MONTHS[month - 1]} {year}</h1>
        {isLocked ? (
          <span className="badge bg-green-100 text-green-700">{t.lockedStatusBadge}</span>
        ) : (
          <span className="badge bg-gray-100 text-gray-500">{t.draftStatusBadge}</span>
        )}
        <Link href="/hr/payroll" className="ml-auto text-sm text-brand hover:underline">{t.allPayrollsLink}</Link>
      </div>

      {!isLocked && (
        <PayrollActions yearMonth={yearMonth} hasPayroll={!!payroll} hasItems={(payroll?.items.length ?? 0) > 0} lang={user.language} />
      )}

      {isLocked && payroll?.lockedBy && (
        <p className="text-sm text-gray-400">
          {t.lockedByPrefix} {payroll.lockedBy.name} {t.lockedByOn} {formatDate(payroll.lockedAt)}
        </p>
      )}

      {payroll && payroll.items.length > 0 ? (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">{t.colEmployee}</th>
                <th className="px-3 py-2 text-right">{t.colBasic}</th>
                <th className="px-3 py-2 text-right">{t.colWorkDays}</th>
                <th className="px-3 py-2 text-right">{t.colAbsentShort}</th>
                <th className="px-3 py-2 text-right">{t.colOtShort}</th>
                <th className="px-3 py-2 text-right">{t.colAttBonus}</th>
                <th className="px-3 py-2 text-right">{t.colOtPremium}</th>
                <th className="px-3 py-2 text-right">{t.colAdHoc}</th>
                <th className="px-3 py-2 text-right">{t.colAdvance}</th>
                <th className="px-3 py-2 text-right">{t.colFinesShort}</th>
                <th className="px-3 py-2 text-right font-bold">{t.colNetPay}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payroll.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 font-medium">{item.employee.user.name}</td>
                  <td className="px-3 py-2 text-right">{item.basicSalary.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{item.workingDays}</td>
                  <td className="px-3 py-2 text-right">
                    {item.absentDays > 0 ? <span className="text-red-500">{item.absentDays}</span> : "0"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.otDays > 0 ? <span className="text-purple-600">{item.otDays}</span> : "0"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.attendanceBonusAmt > 0 ? (
                      item.absenceDeduction === 0
                        ? <span className="text-green-600">{item.attendanceBonusAmt.toLocaleString()}</span>
                        : <span className="text-gray-300">{item.attendanceBonusAmt.toLocaleString()}</span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-purple-600">
                    {item.otPremium > 0 ? `+${item.otPremium.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-green-600">
                    {item.adHocBonuses > 0 ? `+${item.adHocBonuses.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-red-500">
                    {item.advanceDeduction > 0 ? `-${item.advanceDeduction.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-red-500">
                    {item.fineDeduction > 0 ? `-${item.fineDeduction.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-bold">{item.netPay.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Link href={`/hr/payroll/${yearMonth}/slip/${item.employeeId}`} className="text-xs text-brand hover:underline">
                      {t.slipLink}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-100 bg-gray-50">
              <tr>
                <td colSpan={10} className="px-4 py-2 text-right text-sm font-semibold">{t.totalPayout}</td>
                <td className="px-3 py-2 text-right font-bold text-brand">{totalNet.toLocaleString()} MMK</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="card text-center text-gray-400 py-10">
          <p className="mb-2">{t.noPayrollGenerated}</p>
          <p className="text-sm">{t.generateHint}</p>
        </div>
      )}
    </div>
  );
}
