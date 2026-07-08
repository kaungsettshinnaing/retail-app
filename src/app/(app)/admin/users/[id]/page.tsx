import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { updateUser } from "../actions";
import { UserForm } from "../UserForm";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
        submitLabel="Save Changes"
      />
    </div>
  );
}
