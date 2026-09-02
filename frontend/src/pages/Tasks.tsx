import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, fetchMyTasks, createTask, updateTaskStatus } from "../lib/tasks";
import type { TaskCreate } from "../lib/tasks";
import { useDefaultFarm } from "../lib/useDefaultFarm";
import { useAuth } from "../context/AuthContext";
import { fetchUsers } from "../lib/users";
import StatusBadge from "../components/StatusBadge";

const CATEGORY_OPTIONS = ["FEEDING", "WEEDING", "HARVESTING", "MAINTENANCE", "VETERINARY", "CLEANING", "OTHER"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export default function Tasks() {
  const { role } = useAuth();
  const canAssign = role === "ADMIN" || role === "FARM_MANAGER";
  const [tab, setTab] = useState<"mine" | "assign">("mine");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { singleFarm, farms, hasMultipleFarms } = useDefaultFarm();

  const { data: myTasks, isLoading: loadingMine } = useQuery({
    queryKey: ["tasks-mine"],
    queryFn: () => fetchMyTasks(),
  });

  const { data: allTasks, isLoading: loadingAll } = useQuery({
    queryKey: ["tasks-all"],
    queryFn: () => fetchTasks(),
    enabled: tab === "assign" && canAssign,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: canAssign,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-all"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
      setShowForm(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }) =>
      updateTaskStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-all"] });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const farmId = hasMultipleFarms ? (form.get("farm_id") as string) : singleFarm?.id;
    if (!farmId) return;
    const assigneeId = form.get("assignee_id") as string;
    createMutation.mutate({
      farm_id: farmId,
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      category: form.get("category") as TaskCreate["category"],
      priority: form.get("priority") as TaskCreate["priority"],
      due_date: (form.get("due_date") as string) || undefined,
      assignee_ids: assigneeId ? [assigneeId] : [],
    } as TaskCreate);
  }

  const displayTasks = tab === "mine" ? myTasks : allTasks;
  const isLoading = tab === "mine" ? loadingMine : loadingAll;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Tasks</h1>
        {canAssign && (
          <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
            Assign task
          </button>
        )}
      </div>

      {canAssign && (
        <div className="flex gap-4 mb-4 border-b border-line">
          <button
            onClick={() => setTab("mine")}
            className={`pb-2 text-sm font-medium ${tab === "mine" ? "text-plum-800 border-b-2 border-plum-800" : "text-ink-muted"}`}
          >
            My tasks
          </button>
          <button
            onClick={() => setTab("assign")}
            className={`pb-2 text-sm font-medium ${tab === "assign" ? "text-plum-800 border-b-2 border-plum-800" : "text-ink-muted"}`}
          >
            All tasks
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}
        {displayTasks?.length === 0 && <p className="text-sm text-ink-muted">No tasks here.</p>}
        {displayTasks?.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-line p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-ink">{t.title}</p>
                {t.description && <p className="text-sm text-ink-muted mt-0.5">{t.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={t.status} />
                  <span className="text-xs font-mono text-ink-muted">{t.category}</span>
                  <span className="text-xs font-mono text-ink-muted">{t.priority}</span>
                  {t.due_date && <span className="text-xs font-mono text-ink-muted">Due {t.due_date}</span>}
                </div>
              </div>
              {tab === "mine" && t.status !== "COMPLETED" && t.status !== "CANCELLED" && (
                <div className="flex gap-2">
                  {t.status === "PENDING" && (
                    <button
                      onClick={() => statusMutation.mutate({ id: t.id, status: "IN_PROGRESS" })}
                      className="text-xs text-plum-800 font-medium hover:underline"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => statusMutation.mutate({ id: t.id, status: "COMPLETED" })}
                    className="text-xs text-plum-800 font-medium hover:underline"
                  >
                    Mark done
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Assign task</h2>
            {hasMultipleFarms && (
              <select name="farm_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Select farm</option>
                {farms?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            <input name="title" placeholder="Task title (e.g. Weed Field B)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="description" placeholder="Description (optional)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="assignee_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Assign to</option>
              {users?.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
            </select>
            <div className="flex gap-2">
              <select name="category" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="priority" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <label className="text-xs text-ink-muted">Due date (optional)</label>
            <input name="due_date" type="date" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
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
