"use client";

import { useState, useTransition } from "react";
import {
  createArea, updateArea, toggleArea, deleteArea,
  createShelf, updateShelf, toggleShelf, deleteShelf,
  createSection, updateSection, toggleSection, deleteSection,
} from "./actions";

type Section = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  shelfId: string | null;
};
type Shelf = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  sections: Section[];
};
type Area = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  shelves: Shelf[];
  sections: Section[]; // direct sections (shelfId === null)
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`badge ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function SectionRow({ section, areaId, shelfId }: { section: Section; areaId: string; shelfId: string | null }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateSection(section.id, formData);
      if (!res.ok) { setError(res.error); return; }
      setEditing(false);
      setError("");
    });
  }

  function handleToggle() {
    startTransition(async () => { await toggleSection(section.id, !section.isActive); });
  }

  function handleDelete() {
    if (!confirm(`Delete section "${section.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteSection(section.id);
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <div className={`flex flex-col gap-1 py-1.5 pl-4 border-l-2 border-gray-100 ${!section.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">•</span>
        <span className="text-gray-700">{section.name}</span>
        <StatusBadge isActive={section.isActive} />
        <div className="ml-auto flex gap-2 text-xs">
          <button onClick={() => setEditing(!editing)} className="text-brand hover:underline">Edit</button>
          <button onClick={handleToggle} disabled={isPending} className="text-gray-500 hover:underline">
            {section.isActive ? "Deactivate" : "Activate"}
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-red-500 hover:underline">Delete</button>
        </div>
      </div>
      {editing && (
        <form action={handleUpdate} className="flex flex-wrap gap-2 items-end bg-brand-light rounded p-2">
          {error && <p className="text-red-600 text-xs w-full">{error}</p>}
          <input name="name" defaultValue={section.name} className="input w-40 text-xs" required />
          <input name="sortOrder" type="number" defaultValue={section.sortOrder} className="input w-16 text-xs" />
          <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-2 py-1">Cancel</button>
        </form>
      )}
    </div>
  );
}

function AddSectionForm({ areaId, shelfId }: { areaId: string; shelfId: string | null }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createSection(formData);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      setError("");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-brand hover:underline pl-4">
        + Add Section
      </button>
    );
  }

  return (
    <form action={handleCreate} className="flex flex-wrap gap-2 items-end pl-4">
      {error && <p className="text-red-600 text-xs w-full">{error}</p>}
      <input type="hidden" name="areaId" value={areaId} />
      {shelfId && <input type="hidden" name="shelfId" value={shelfId} />}
      <input name="name" placeholder="Section name" className="input w-40 text-xs" required />
      <input name="sortOrder" type="number" defaultValue={0} className="input w-16 text-xs" placeholder="Sort" />
      <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">Add</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-outline text-xs px-2 py-1">Cancel</button>
    </form>
  );
}

function ShelfBlock({ shelf, areaId }: { shelf: Shelf; areaId: string }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateShelf(shelf.id, formData);
      if (!res.ok) { setError(res.error); return; }
      setEditing(false);
      setError("");
    });
  }

  function handleToggle() {
    startTransition(async () => { await toggleShelf(shelf.id, !shelf.isActive); });
  }

  function handleDelete() {
    if (!confirm(`Delete shelf "${shelf.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteShelf(shelf.id);
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <div className={`space-y-1.5 border-t border-gray-100 pt-2 ${!shelf.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">▸</span>
        <span className="font-medium text-gray-700">{shelf.name}</span>
        <StatusBadge isActive={shelf.isActive} />
        <div className="ml-auto flex gap-2 text-xs">
          <button onClick={() => setEditing(!editing)} className="text-brand hover:underline">Edit</button>
          <button onClick={handleToggle} disabled={isPending} className="text-gray-500 hover:underline">
            {shelf.isActive ? "Deactivate" : "Activate"}
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-red-500 hover:underline">Delete</button>
        </div>
      </div>
      {editing && (
        <form action={handleUpdate} className="flex flex-wrap gap-2 items-end bg-brand-light rounded p-2">
          {error && <p className="text-red-600 text-xs w-full">{error}</p>}
          <input name="name" defaultValue={shelf.name} className="input w-40 text-xs" required />
          <input name="sortOrder" type="number" defaultValue={shelf.sortOrder} className="input w-16 text-xs" />
          <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-2 py-1">Cancel</button>
        </form>
      )}
      {shelf.sections.map((s) => (
        <SectionRow key={s.id} section={s} areaId={areaId} shelfId={shelf.id} />
      ))}
      <AddSectionForm areaId={areaId} shelfId={shelf.id} />
    </div>
  );
}

function AddShelfForm({ areaId }: { areaId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createShelf(formData);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      setError("");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-brand hover:underline">
        + Add Shelf
      </button>
    );
  }

  return (
    <form action={handleCreate} className="flex flex-wrap gap-2 items-end border-t border-gray-100 pt-2">
      {error && <p className="text-red-600 text-xs w-full">{error}</p>}
      <input type="hidden" name="areaId" value={areaId} />
      <input name="name" placeholder="Shelf name" className="input w-40 text-xs" required />
      <input name="sortOrder" type="number" defaultValue={0} className="input w-16 text-xs" placeholder="Sort" />
      <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">Add</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-outline text-xs px-2 py-1">Cancel</button>
    </form>
  );
}

function AreaCard({ area }: { area: Area }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateArea(area.id, formData);
      if (!res.ok) { setError(res.error); return; }
      setEditing(false);
      setError("");
    });
  }

  function handleToggle() {
    startTransition(async () => { await toggleArea(area.id, !area.isActive); });
  }

  function handleDelete() {
    if (!confirm(`Delete area "${area.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteArea(area.id);
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <div className={`card space-y-2 ${!area.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800">{area.name}</h3>
        <StatusBadge isActive={area.isActive} />
        <div className="ml-auto flex gap-3 text-xs">
          <button onClick={() => setEditing(!editing)} className="text-brand hover:underline">Edit</button>
          <button onClick={handleToggle} disabled={isPending} className="text-gray-500 hover:underline">
            {area.isActive ? "Deactivate" : "Activate"}
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-red-500 hover:underline">Delete</button>
        </div>
      </div>

      {editing && (
        <form action={handleUpdate} className="flex flex-wrap gap-2 items-end bg-brand-light rounded p-2">
          {error && <p className="text-red-600 text-xs w-full">{error}</p>}
          <input name="name" defaultValue={area.name} className="input w-48 text-xs" required />
          <input name="sortOrder" type="number" defaultValue={area.sortOrder} className="input w-16 text-xs" />
          <button type="submit" disabled={isPending} className="btn-primary text-xs px-2 py-1">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-2 py-1">Cancel</button>
        </form>
      )}

      <div className="space-y-1.5">
        {area.sections.map((s) => (
          <SectionRow key={s.id} section={s} areaId={area.id} shelfId={null} />
        ))}
        <AddSectionForm areaId={area.id} shelfId={null} />
      </div>

      <div className="space-y-1.5">
        {area.shelves.map((sh) => (
          <ShelfBlock key={sh.id} shelf={sh} areaId={area.id} />
        ))}
        <AddShelfForm areaId={area.id} />
      </div>
    </div>
  );
}

function AddAreaForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createArea(formData);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      setError("");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        + Add Area
      </button>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">New Area</h3>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <form action={handleCreate} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Name</label>
          <input name="name" className="input w-48" placeholder="e.g. Main Warehouse" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Sort order</label>
          <input name="sortOrder" type="number" defaultValue={0} className="input w-20" />
        </div>
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline text-sm">Cancel</button>
      </form>
    </div>
  );
}

export default function WarehouseEditor({ areas }: { areas: Area[] }) {
  return (
    <div className="space-y-4">
      <AddAreaForm />
      {areas.length === 0 ? (
        <div className="card text-center text-sm text-gray-400 py-8">
          No warehouse areas yet — add one above.
        </div>
      ) : (
        <div className="space-y-4">
          {areas.map((a) => (
            <AreaCard key={a.id} area={a} />
          ))}
        </div>
      )}
    </div>
  );
}
