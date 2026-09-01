import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLivestock, createLivestock, verifyAnimal } from "../lib/livestock";
import type { LivestockCreate } from "../lib/livestock";
import { useDefaultFarm } from "../lib/useDefaultFarm";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function LivestockPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { farms, singleFarm, hasMultipleFarms } = useDefaultFarm();
  const { role } = useAuth();
  const canVerify = role === "ADMIN" || role === "FARM_MANAGER";

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

  const verifyMutation = useMutation({
    mutationFn: verifyAnimal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["livestock"] }),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const farmId = hasMultipleFarms ? (form.get("farm_id") as string) : singleFarm?.id;
    if (!farmId) return;
    createMutation.mutate({
      farm_id: farmId,
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
        <h1 className="text-xl font-semibold text-ink">Livestock</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Register animal
        </button>
      </div>

      <p className="text-xs text-ink-muted mb-3">
        Newly registered animals start as <span className="font-mono">PENDING VERIFICATION</span> until a farm manager confirms them.
      </p>

      <input
        placeholder="Search by tag number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-line rounded-lg px-3 py-2 text-sm mb-4 w-64 focus:border-plum-600 focus:outline-none focus:ring-2 focus:ring-plum-100"
      />

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink-muted text-left">
            <tr>
              <th className="px-4 py-2">Tag</th>
              <th className="px-4 py-2">Species</th>
              <th className="px-4 py-2">Breed</th>
              <th className="px-4 py-2">Sex</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-4 text-ink-muted">Loading...</td></tr>}
            {animals?.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="px-4 py-2 font-mono font-medium text-ink">{a.tag_number}</td>
                <td className="px-4 py-2 text-ink-muted">{a.species}</td>
                <td className="px-4 py-2 text-ink-muted">{a.breed ?? "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{a.sex}</td>
                <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-2">
                  {a.status === "PENDING_VERIFICATION" && canVerify && (
                    <button
                      onClick={() => verifyMutation.mutate(a.id)}
                      className="text-plum-800 text-xs hover:underline font-medium"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Register animal</h2>
            {hasMultipleFarms && (
              <select name="farm_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
                <option value="">Select farm</option>
                {farms?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            <input name="tag_number" placeholder="Tag number" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="species" placeholder="Species (default: Cattle)" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="breed" placeholder="Breed" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="sex" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select sex</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <input name="location" placeholder="Location" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
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
