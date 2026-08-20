import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSales, fetchCustomers, createSale } from "../lib/sales";
import type { SaleCreate } from "../lib/sales";
import StatusBadge from "../components/StatusBadge";

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [itemType, setItemType] = useState<"LIVESTOCK" | "PRODUCT">("PRODUCT");
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({ queryKey: ["sales"], queryFn: fetchSales });
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  const createMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["livestock"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      customer_id: form.get("customer_id") as string,
      sale_date: form.get("sale_date") as string,
      payment_status: form.get("payment_status") as SaleCreate["payment_status"],
      payment_method: form.get("payment_method") as string,
      items: [{
        item_type: itemType,
        livestock_id: itemType === "LIVESTOCK" ? (form.get("reference_id") as string) : undefined,
        inventory_item_id: itemType === "PRODUCT" ? (form.get("reference_id") as string) : undefined,
        quantity: form.get("quantity") as string,
        unit_price: form.get("unit_price") as string,
      }],
    } as SaleCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Sales</h1>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
          Record sale
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="px-4 py-4 text-gray-400">Loading...</td></tr>}
            {sales?.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{s.sale_date}</td>
                <td className="px-4 py-2">KES {Number(s.total_amount).toLocaleString()}</td>
                <td className="px-4 py-2"><StatusBadge status={s.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Record sale</h2>
            <select name="customer_id" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Select customer</option>
              {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input name="sale_date" type="date" required className="w-full border rounded px-3 py-2 text-sm" />
            <select name="payment_status" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
            <input name="payment_method" placeholder="Payment method (cash, M-Pesa...)" className="w-full border rounded px-3 py-2 text-sm" />

            <div className="flex gap-2">
              <label className="text-sm flex items-center gap-1">
                <input type="radio" checked={itemType === "PRODUCT"} onChange={() => setItemType("PRODUCT")} /> Product
              </label>
              <label className="text-sm flex items-center gap-1">
                <input type="radio" checked={itemType === "LIVESTOCK"} onChange={() => setItemType("LIVESTOCK")} /> Livestock
              </label>
            </div>
            <input name="reference_id" placeholder={itemType === "PRODUCT" ? "Inventory item ID" : "Livestock ID"} required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="quantity" type="number" step="0.01" defaultValue="1" placeholder="Quantity" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="unit_price" type="number" step="0.01" placeholder="Unit price" required className="w-full border rounded px-3 py-2 text-sm" />
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
