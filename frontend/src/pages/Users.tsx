import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, deactivateUser, activateUser, registerUser } from "../lib/users";
import type { UserCreate } from "../lib/users";
import StatusBadge from "../components/StatusBadge";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "FARM_MANAGER", label: "Farm Manager" },
  { value: "INVENTORY_STAFF", label: "Inventory Staff" },
  { value: "VETERINARY_STAFF", label: "Veterinary Staff" },
  { value: "SALES_STAFF", label: "Sales Staff" },
  { value: "GENERAL_STAFF", label: "General Staff" },
];

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateUser(id) : activateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const createMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      full_name: form.get("full_name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      role: form.get("role") as UserCreate["role"],
    } as UserCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl font-semibold text-ink">Users</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Add user
        </button>
      </div>
      <p className="text-sm text-ink-muted mb-6">Manage staff access.</p>

      {createMutation.isError && (
        <div className="mb-4 rounded-lg bg-rust-100 px-3 py-2 text-sm text-rust-700">
          Could not add user — check the email isn't already registered.
        </div>
      )}

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-2 font-medium text-ink">{u.full_name}</td>
                <td className="px-4 py-2 text-ink-muted">{u.email}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted">{u.role}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={u.is_active ? "ACTIVE" : "INACTIVE"} />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: u.id, active: u.is_active })}
                    className="text-xs font-medium text-plum-800 hover:underline"
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
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
            <h2 className="font-semibold text-ink mb-2">Add user</h2>
            <input name="full_name" placeholder="Full name" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="Email" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="password" type="password" placeholder="Temporary password" required minLength={8} className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="role" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select role</option>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
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
