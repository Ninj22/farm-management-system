import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEquipment, createEquipment, recordMaintenance } from "../lib/equipment";
import type { EquipmentCreate } from "../lib/equipment";
import StatusBadge from "../components/StatusBadge";

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [maintenanceFor, setMaintenanceFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
    createMutation.mutate({
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
        <h1 className="text-xl font-semibold">Assets & Equipment</h1>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
          Add equipment
        </button>
      </div>

      <input
        placeholder="Search equipment..."
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
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-4 text-gray-400">Loading...</td></tr>}
            {equipment?.map((eq) => (
              <tr key={eq.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium">{eq.name}</td>
                <td className="px-4 py-2 text-gray-500">{eq.category ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">{eq.location ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={eq.status} /></td>
                <td className="px-4 py-2">
                  <button onClick={() => setMaintenanceFor(eq.id)} className="text-green-700 text-xs hover:underline">
                    Log maintenance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleCreate} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Add equipment</h2>
            <input name="name" placeholder="Name" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="category" placeholder="Category (e.g. Tractor)" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="serial_number" placeholder="Serial number" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="location" placeholder="Location" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="condition" placeholder="Condition" className="w-full border rounded px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-green-700 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}

      {maintenanceFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleMaintenance} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Log maintenance</h2>
            <input name="maintenance_date" type="date" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="service_type" placeholder="Service type (Preventive, Repair...)" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="cost" type="number" step="0.01" placeholder="Cost" className="w-full border rounded px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMaintenanceFor(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-green-700 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
