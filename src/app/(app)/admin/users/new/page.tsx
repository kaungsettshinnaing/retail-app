import { createUser } from "../actions";
import { UserForm } from "../UserForm";

export default function NewUserPage() {
  return (
    <div className="space-y-4">
      <h1 className="section-title">New User</h1>
      <UserForm action={createUser} submitLabel="Create User" isNew />
    </div>
  );
}
