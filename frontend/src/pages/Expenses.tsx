import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExpenses, createExpense } from "../lib/expenses";
import type { ExpenseCreate } from "../lib/expenses";

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      category: form.get("category") as ExpenseCreate["category"],
      amount: form.get("amount") as string,
      expense_date: form.get("expense_date") as string,
      description: form.get("description") as string,
    } as ExpenseCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
          Add expense
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-4 text-gray-400">Loading...</td></tr>}
            {expenses?.map((e) => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{e.expense_date}</td>
                <td className="px-4 py-2 text-gray-500">{e.category}</td>
                <td className="px-4 py-2 text-gray-500">{e.description ?? "—"}</td>
                <td className="px-4 py-2">KES {Number(e.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Add expense</h2>
            <select name="category" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Category</option>
              <option value="FEED">Feed</option>
              <option value="VET_SERVICES">Vet services</option>
              <option value="MEDICINE">Medicine</option>
              <option value="SEEDS">Seeds</option>
              <option value="FERTILIZER">Fertilizer</option>
              <option value="LABOR">Labor</option>
              <option value="TRANSPORT">Transport</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="UTILITIES">Utilities</option>
              <option value="REPAIRS">Repairs</option>
              <option value="OTHER">Other</option>
            </select>
            <input name="amount" type="number" step="0.01" placeholder="Amount" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="expense_date" type="date" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="description" placeholder="Description" className="w-full border rounded px-3 py-2 text-sm" />
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
