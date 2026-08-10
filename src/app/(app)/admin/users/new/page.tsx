import { createUser } from "../actions";
import { UserForm } from "../UserForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export default async function NewUserPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.userNewTitle}</h1>
      <UserForm action={createUser} submitLabel={t.userCreateButton} isNew lang={user.language} />
    </div>
  );
}
