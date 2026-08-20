import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInventory, createInventoryItem } from "../lib/inventory";
import type { InventoryItem } from "../lib/inventory";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory", search],
    queryFn: () => fetchInventory(search),
  });

  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowForm(false);
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
      min_stock_level: form.get("min_stock_level") as string,
      purchase_price: form.get("purchase_price") as string,
    } as any);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Inventory</h1>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
          Add item
        </button>
      </div>

      <input
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm mb-4 w-64"
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">On hand</th>
              <th className="px-4 py-2">Min level</th>
              <th className="px-4 py-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-4 text-gray-400">Loading...</td></tr>
            )}
            {items?.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2 text-gray-500">{item.category}</td>
                <td className={`px-4 py-2 ${Number(item.quantity_on_hand) <= Number(item.min_stock_level) ? "text-red-600 font-medium" : ""}`}>
                  {item.quantity_on_hand}
                </td>
                <td className="px-4 py-2 text-gray-500">{item.min_stock_level}</td>
                <td className="px-4 py-2 text-gray-500">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Add inventory item</h2>
            <input name="name" placeholder="Name" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="category" placeholder="Category (e.g. ANIMAL_FEED)" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="unit" placeholder="Unit (e.g. kg)" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="quantity_on_hand" type="number" step="0.01" placeholder="Starting quantity" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="min_stock_level" type="number" step="0.01" placeholder="Minimum stock level" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="purchase_price" type="number" step="0.01" placeholder="Purchase price" className="w-full border rounded px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-green-700 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
