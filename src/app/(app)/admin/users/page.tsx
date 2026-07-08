import Link from "next/link";
import { prisma as db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await db.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Staff Users</h1>
        <Link href="/admin/users/new" className="btn-primary text-sm">+ New User</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Name</th>
              <th className="py-2 px-3 text-left">Username</th>
              <th className="py-2 px-3 text-left">Roles</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">No users yet.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50 ${!u.isActive ? "opacity-50" : ""}`}>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{u.username}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className="badge bg-brand-light text-brand">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="text-xs text-brand hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
