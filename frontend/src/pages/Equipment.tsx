import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEquipment, createEquipment, recordMaintenance } from "../lib/equipment";
import type { EquipmentCreate } from "../lib/equipment";
import { useDefaultFarm } from "../lib/useDefaultFarm";
import StatusBadge from "../components/StatusBadge";

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [maintenanceFor, setMaintenanceFor] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { farms, singleFarm, hasMultipleFarms } = useDefaultFarm();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", search],
    queryFn: () => fetchEquipment(search),
  });

  const createMutation = useMutation({
    mutationFn: createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setShowForm(false);
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { maintenance_date: string; service_type: string; cost: string } }) =>
      recordMaintenance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setMaintenanceFor(null);
    },
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const farmId = hasMultipleFarms ? (form.get("farm_id") as string) : singleFarm?.id;
    if (!farmId) return;
    createMutation.mutate({
      farm_id: farmId,
      name: form.get("name") as string,
      category: form.get("category") as string,
      serial_number: form.get("serial_number") as string,
      location: form.get("location") as string,
      condition: form.get("condition") as string,
    } as EquipmentCreate);
  }

  function handleMaintenance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!maintenanceFor) return;
    const form = new FormData(e.currentTarget);
    maintenanceMutation.mutate({
      id: maintenanceFor,
      payload: {
        maintenance_date: form.get("maintenance_date") as string,
        service_type: form.get("service_type") as string,
        cost: form.get("cost") as string,
      },
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Assets & Equipment</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Add equipment
        </button>
      </div>

      <input
        placeholder="Search equipment..."
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
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {equipment?.map((eq) => (
              <tr key={eq.id} className="border-t border-line">
                <td className="px-4 py-2 font-medium text-ink">{eq.name}</td>
                <td className="px-4 py-2 text-ink-muted">{eq.category ?? "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{eq.location ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={eq.status} /></td>
                <td className="px-4 py-2">
                  <button onClick={() => setMaintenanceFor(eq.id)} className="text-plum-800 text-xs hover:underline font-medium">
                    Log maintenance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Add equipment</h2>
            {hasMultipleFarms && (
              <select name="farm_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Select farm</option>
                {farms?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            <input name="name" placeholder="Name" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="category" placeholder="Category (e.g. Tractor)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="serial_number" placeholder="Serial number" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="location" placeholder="Location" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="condition" placeholder="Condition" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}

      {maintenanceFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleMaintenance} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Log maintenance</h2>
            <input name="maintenance_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="service_type" placeholder="Service type (Preventive, Repair...)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="cost" type="number" step="0.01" placeholder="Cost" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMaintenanceFor(null)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
