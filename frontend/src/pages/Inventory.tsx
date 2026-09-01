import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInventory, createInventoryItem } from "../lib/inventory";
import { recordInternalUse } from "../lib/internalUse";
import { fetchLivestock } from "../lib/livestock";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [useFor, setUseFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory", search],
    queryFn: () => fetchInventory(search),
  });

  const { data: livestock } = useQuery({ queryKey: ["livestock", ""], queryFn: () => fetchLivestock("") });

  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowForm(false);
    },
  });

  const internalUseMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { quantity: string; used_for: string; livestock_id?: string; notes?: string } }) =>
      recordInternalUse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setUseFor(null);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      name: form.get("name") as string,
      category: form.get("category") as string,
      unit: form.get("unit") as string,
      quantity_on_hand: form.get("quantity_on_hand") as string,
      reorder_level: form.get("reorder_level") as string,
      purchase_price: form.get("purchase_price") as string,
    } as any);
  }

  function handleInternalUse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!useFor) return;
    const form = new FormData(e.currentTarget);
    const livestockId = form.get("livestock_id") as string;
    internalUseMutation.mutate({
      id: useFor,
      payload: {
        quantity: form.get("quantity") as string,
        used_for: form.get("used_for") as string,
        livestock_id: livestockId || undefined,
        notes: (form.get("notes") as string) || undefined,
      },
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Inventory</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Add item
        </button>
      </div>

      <input
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-line rounded-lg px-3 py-2 text-sm mb-4 w-64 focus:border-plum-600 focus:outline-none focus:ring-2 focus:ring-plum-100"
      />

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">On hand</th>
              <th className="px-4 py-2">Reorder level</th>
              <th className="px-4 py-2">Unit</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {items?.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="px-4 py-2 font-medium text-ink">{item.name}</td>
                <td className="px-4 py-2 text-ink-muted">{item.category}</td>
                <td className={`px-4 py-2 font-mono ${Number(item.quantity_on_hand) <= Number(item.reorder_level) ? "text-rust-700 font-semibold" : "text-ink"}`}>
                  {item.quantity_on_hand}
                </td>
                <td className="px-4 py-2 font-mono text-ink-muted">{item.reorder_level}</td>
                <td className="px-4 py-2 text-ink-muted">{item.unit}</td>
                <td className="px-4 py-2">
                  <button onClick={() => setUseFor(item.id)} className="text-plum-800 text-xs hover:underline font-medium">
                    Use internally
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Add inventory item</h2>
            <input name="name" placeholder="Name" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="category" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Category</option>
              <option value="ANIMAL_FEED">Animal feed</option>
              <option value="SEEDS">Seeds</option>
              <option value="FERTILIZERS">Fertilizers</option>
              <option value="PESTICIDES">Pesticides</option>
              <option value="VETERINARY_MEDICINE">Veterinary medicine</option>
              <option value="DEWORMERS">Dewormers</option>
              <option value="ANTIBIOTICS">Antibiotics</option>
              <option value="VACCINES">Vaccines</option>
              <option value="FUEL">Fuel</option>
              <option value="TOOLS">Tools</option>
              <option value="CONSUMABLES">Consumables</option>
              <option value="OTHER">Other</option>
            </select>
            <input name="unit" placeholder="Unit (e.g. kg)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="quantity_on_hand" type="number" step="0.01" placeholder="Starting quantity" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="reorder_level" type="number" step="0.01" placeholder="Reorder level" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="purchase_price" type="number" step="0.01" placeholder="Purchase price" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}

      {useFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleInternalUse} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Use internally</h2>
            <p className="text-xs text-ink-muted -mt-2">Removes stock without a sale — e.g. harvested feed given to livestock, or spoilage.</p>
            <input name="quantity" type="number" step="0.01" placeholder="Quantity used" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="used_for" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Reason</option>
              <option value="Livestock feed">Livestock feed</option>
              <option value="Farm consumption">Farm consumption</option>
              <option value="Spoilage">Spoilage</option>
              <option value="Sample/testing">Sample/testing</option>
              <option value="Other">Other</option>
            </select>
            <select name="livestock_id" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Link to animal/herd (optional)</option>
              {livestock?.map((a) => <option key={a.id} value={a.id}>{a.tag_number} — {a.species}</option>)}
            </select>
            <input name="notes" placeholder="Notes (optional)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setUseFor(null)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
