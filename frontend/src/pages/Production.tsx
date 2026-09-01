import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProduction, recordProduction } from "../lib/production";
import type { ProductionCreate } from "../lib/production";
import { fetchLivestock } from "../lib/livestock";
import { fetchInventory } from "../lib/inventory";

export default function Production() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({ queryKey: ["production"], queryFn: () => fetchProduction() });
  const { data: livestock } = useQuery({ queryKey: ["livestock", ""], queryFn: () => fetchLivestock("") });
  const { data: items } = useQuery({ queryKey: ["inventory", ""], queryFn: () => fetchInventory("") });

  const createMutation = useMutation({
    mutationFn: recordProduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const livestockId = form.get("livestock_id") as string;
    const produceItemId = form.get("produce_inventory_item_id") as string;
    createMutation.mutate({
      farm_id: form.get("farm_id") as string,
      livestock_id: livestockId || undefined,
      product_type: form.get("product_type") as string,
      quantity: form.get("quantity") as string,
      unit: form.get("unit") as string,
      production_date: form.get("production_date") as string,
      produce_inventory_item_id: produceItemId || undefined,
    } as ProductionCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Production</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Log production
        </button>
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {records?.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-2 font-mono text-xs">{r.production_date}</td>
                <td className="px-4 py-2 text-ink">{r.product_type}</td>
                <td className="px-4 py-2 font-mono text-gold-700">{r.quantity} {r.unit}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {r.livestock_id ? livestock?.find((a) => a.id === r.livestock_id)?.tag_number ?? "Animal" : "Unit-level"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Log production</h2>
            <input name="farm_id" placeholder="Farm ID" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="livestock_id" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Whole unit (e.g. dairy herd, layer house)</option>
              {livestock?.map((a) => <option key={a.id} value={a.id}>{a.tag_number} — {a.species}</option>)}
            </select>
            <input name="product_type" placeholder="Product (Milk, Eggs...)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input name="quantity" type="number" step="0.01" placeholder="Quantity" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
              <input name="unit" placeholder="Unit (litres, eggs...)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            </div>
            <input name="production_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="produce_inventory_item_id" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Add to inventory item (optional)</option>
              {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
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
