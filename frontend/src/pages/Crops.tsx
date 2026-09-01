import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCrops, createCrop, fetchFields } from "../lib/crops";
import type { CropCreate } from "../lib/crops";
import StatusBadge from "../components/StatusBadge";

export default function Crops() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: crops, isLoading } = useQuery({ queryKey: ["crops"], queryFn: () => fetchCrops() });
  const { data: fields } = useQuery({ queryKey: ["fields"], queryFn: fetchFields });
  const cropTypeSuggestions = Array.from(new Set((crops ?? []).map((c) => c.crop_type))).sort();

  const createMutation = useMutation({
    mutationFn: createCrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      field_id: form.get("field_id") as string,
      crop_type: form.get("crop_type") as string,
      variety: form.get("variety") as string,
      planting_date: form.get("planting_date") as string,
      expected_harvest_date: form.get("expected_harvest_date") as string,
      quantity_planted: form.get("quantity_planted") as string,
      planting_unit: form.get("planting_unit") as string,
    } as CropCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Crops</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Plant crop
        </button>
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Crop</th>
              <th className="px-4 py-2">Planted</th>
              <th className="px-4 py-2">Expected harvest</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {crops?.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-2 font-medium text-ink">{c.crop_type}{c.variety ? ` — ${c.variety}` : ""}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted">{c.planting_date ?? "—"}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted">{c.expected_harvest_date ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-2">
                  <Link to={`/crops/${c.id}`} className="text-plum-800 text-xs hover:underline font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Plant a crop</h2>
            <select name="field_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select field</option>
              {fields?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <input name="crop_type" list="crop-types" placeholder="Crop type (e.g. Maize, Sukuma Wiki)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <datalist id="crop-types">
              {cropTypeSuggestions.map((t) => <option key={t} value={t} />)}
            </datalist>
            <input name="variety" placeholder="Variety (optional)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-ink-muted">Planting date</label>
            <input name="planting_date" type="date" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-ink-muted">Expected harvest date</label>
            <input name="expected_harvest_date" type="date" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input name="quantity_planted" type="number" step="0.01" placeholder="Quantity planted" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
              <input name="planting_unit" placeholder="Unit (kg, bags...)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            </div>
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
