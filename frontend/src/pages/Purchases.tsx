import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPurchases, fetchSuppliers, createPurchase } from "../lib/purchases";
import type { PurchaseCreate } from "../lib/purchases";
import { fetchInventory } from "../lib/inventory";
import StatusBadge from "../components/StatusBadge";

export default function Purchases() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({ queryKey: ["purchases"], queryFn: fetchPurchases });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });
  const { data: items } = useQuery({ queryKey: ["inventory", ""], queryFn: () => fetchInventory("") });

  const createMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      supplier_id: form.get("supplier_id") as string,
      invoice_number: form.get("invoice_number") as string,
      purchase_date: form.get("purchase_date") as string,
      payment_status: form.get("payment_status") as PurchaseCreate["payment_status"],
      items: [{
        item_id: form.get("item_id") as string,
        quantity: form.get("quantity") as string,
        unit_price: form.get("unit_price") as string,
      }],
    } as PurchaseCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Purchases</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Record purchase
        </button>
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {purchases?.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-2 font-mono text-xs">{p.purchase_date}</td>
                <td className="px-4 py-2 text-ink-muted">{p.invoice_number ?? "—"}</td>
                <td className="px-4 py-2 font-mono">KES {Number(p.total_amount).toLocaleString()}</td>
                <td className="px-4 py-2"><StatusBadge status={p.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Record purchase</h2>
            <select name="supplier_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select supplier</option>
              {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input name="invoice_number" placeholder="Invoice number (optional)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="purchase_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="payment_status" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>

            <p className="text-xs text-ink-muted pt-2">One item per purchase for now — support for multiple items is coming.</p>
            <select name="item_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select item</option>
              {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input name="quantity" type="number" step="0.01" placeholder="Quantity" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
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
