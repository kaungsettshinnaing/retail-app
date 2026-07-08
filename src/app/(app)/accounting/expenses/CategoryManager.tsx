"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseCategory, renameExpenseCategory, toggleExpenseCategory } from "./actions";

type Category = { id: string; name: string; isActive: boolean };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="card space-y-3">
      <div className="section-title text-base">Categories</div>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <ul className="divide-y divide-gray-50">
        {categories.length === 0 && <li className="py-2 text-sm text-gray-400">No categories yet.</li>}
        {categories.map((c) => (
          <li key={c.id} className="py-2 flex items-center gap-2">
            {editingId === c.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input flex-1 text-sm" />
                <button
                  disabled={pending}
                  onClick={() => run(() => renameExpenseCategory(c.id, editName), () => setEditingId(null))}
                  className="btn-primary text-sm py-1"
                >
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="btn-outline text-sm py-1">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className={`flex-1 text-sm ${c.isActive ? "text-gray-800" : "text-gray-400 line-through"}`}>{c.name}</span>
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditName(c.name);
                  }}
                  className="text-xs text-brand hover:underline"
                >
                  Rename
                </button>
                <button
                  disabled={pending}
                  onClick={() => run(() => toggleExpenseCategory(c.id, !c.isActive))}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="input flex-1 text-sm"
        />
        <button
          disabled={pending}
          onClick={() => run(() => createExpenseCategory(newName), () => setNewName(""))}
          className="btn-primary text-sm py-1"
        >
          Add
        </button>
      </div>
    </div>
  );
}
