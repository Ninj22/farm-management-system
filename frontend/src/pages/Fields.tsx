import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFields, createField } from "../lib/crops";
import type { FieldCreate } from "../lib/crops";

export default function Fields() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: fields, isLoading } = useQuery({ queryKey: ["fields"], queryFn: fetchFields });

  const createMutation = useMutation({
    mutationFn: createField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      farm_id: form.get("farm_id") as string,
      name: form.get("name") as string,
      size: form.get("size") as string,
      size_unit: form.get("size_unit") as string,
      location: form.get("location") as string,
    } as FieldCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Fields</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Add field
        </button>
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {fields?.map((f) => (
              <tr key={f.id} className="border-t border-line">
                <td className="px-4 py-2 font-medium text-ink">{f.name}</td>
                <td className="px-4 py-2 text-ink-muted">{f.size ? `${f.size} ${f.size_unit ?? ""}` : "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{f.location ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Add field</h2>
            <input name="farm_id" placeholder="Farm ID" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="name" placeholder="Field name (e.g. Field A)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input name="size" type="number" step="0.01" placeholder="Size" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
              <input name="size_unit" placeholder="Unit (acres/hectares)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            </div>
            <input name="location" placeholder="Location" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
