import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLivestock, createLivestock } from "../lib/livestock";
import type { LivestockCreate } from "../lib/livestock";
import StatusBadge from "../components/StatusBadge";

export default function LivestockPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: animals, isLoading } = useQuery({
    queryKey: ["livestock", search],
    queryFn: () => fetchLivestock(search),
  });

  const createMutation = useMutation({
    mutationFn: createLivestock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livestock"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      tag_number: form.get("tag_number") as string,
      species: (form.get("species") as string) || "Cattle",
      breed: form.get("breed") as string,
      sex: form.get("sex") as "MALE" | "FEMALE",
      location: form.get("location") as string,
    } as LivestockCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Livestock</h1>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
          Register animal
        </button>
      </div>

      <input
        placeholder="Search by tag number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm mb-4 w-64"
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Tag</th>
              <th className="px-4 py-2">Species</th>
              <th className="px-4 py-2">Breed</th>
              <th className="px-4 py-2">Sex</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-4 text-gray-400">Loading...</td></tr>}
            {animals?.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium">{a.tag_number}</td>
                <td className="px-4 py-2 text-gray-500">{a.species}</td>
                <td className="px-4 py-2 text-gray-500">{a.breed ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">{a.sex}</td>
                <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Register animal</h2>
            <input name="tag_number" placeholder="Tag number" required className="w-full border rounded px-3 py-2 text-sm" />
            <input name="species" placeholder="Species (default: Cattle)" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="breed" placeholder="Breed" className="w-full border rounded px-3 py-2 text-sm" />
            <select name="sex" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Select sex</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <input name="location" placeholder="Location" className="w-full border rounded px-3 py-2 text-sm" />
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
