import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { updateUser } from "../actions";
import { UserForm } from "../UserForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await requireSession();
  const t = adminDict[sessionUser.language];
  const user = await db.user.findUnique({ where: { id } });
  if (!user) notFound();

  const action = updateUser.bind(null, id);

  return (
    <div className="space-y-4">
      <h1 className="section-title">{user.name}</h1>
      <UserForm
        action={action}
        defaults={user}
        userId={id}
        submitLabel={t.saveChanges}
        lang={sessionUser.language}
      />
    </div>
  );
}
