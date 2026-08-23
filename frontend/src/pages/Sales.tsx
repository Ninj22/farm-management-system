import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSales, fetchCustomers, createSale } from "../lib/sales";
import type { SaleCreate } from "../lib/sales";
import { fetchLivestock } from "../lib/livestock";
import { fetchInventory } from "../lib/inventory";
import StatusBadge from "../components/StatusBadge";

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [itemType, setItemType] = useState<"LIVESTOCK" | "PRODUCT">("PRODUCT");
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({ queryKey: ["sales"], queryFn: fetchSales });
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const { data: livestock } = useQuery({ queryKey: ["livestock", ""], queryFn: () => fetchLivestock("") });
  const { data: items } = useQuery({ queryKey: ["inventory", ""], queryFn: () => fetchInventory("") });

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
        <h1 className="text-xl font-semibold text-ink">Sales</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Record sale
        </button>
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {sales?.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-2 font-mono text-xs">{s.sale_date}</td>
                <td className="px-4 py-2 font-mono">KES {Number(s.total_amount).toLocaleString()}</td>
                <td className="px-4 py-2"><StatusBadge status={s.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Record sale</h2>
            <select name="customer_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select customer</option>
              {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input name="sale_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="payment_status" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
            <input name="payment_method" placeholder="Payment method (cash, M-Pesa...)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />

            <p className="text-xs text-ink-muted pt-2">One item per sale for now — support for multiple items is coming.</p>
            <div className="flex gap-4">
              <label className="text-sm flex items-center gap-1.5 text-ink">
                <input type="radio" checked={itemType === "PRODUCT"} onChange={() => setItemType("PRODUCT")} /> Product
              </label>
              <label className="text-sm flex items-center gap-1.5 text-ink">
                <input type="radio" checked={itemType === "LIVESTOCK"} onChange={() => setItemType("LIVESTOCK")} /> Livestock
              </label>
            </div>

            {itemType === "PRODUCT" ? (
              <select name="reference_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Select inventory item</option>
                {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            ) : (
              <select name="reference_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Select animal</option>
                {livestock?.filter((a) => a.status === "ACTIVE").map((a) => (
                  <option key={a.id} value={a.id}>{a.tag_number} — {a.species}</option>
                ))}
              </select>
            )}

            <input name="quantity" type="number" step="0.01" defaultValue="1" placeholder="Quantity" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="unit_price" type="number" step="0.01" placeholder="Unit price" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />

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
