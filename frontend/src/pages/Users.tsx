import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, deactivateUser, activateUser } from "../lib/users";
import StatusBadge from "../components/StatusBadge";

export default function Users() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateUser(id) : activateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-1">Users</h1>
      <p className="text-sm text-ink-muted mb-6">Manage staff access. New accounts are created via the register endpoint for now.</p>

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
    </div>
  );
}
