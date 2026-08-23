import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUpcomingTreatments, recordTreatment } from "../lib/veterinary";
import type { TreatmentCreate } from "../lib/veterinary";
import { fetchLivestock } from "../lib/livestock";
import { fetchInventory } from "../lib/inventory";

export default function Veterinary() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: upcoming, isLoading } = useQuery({
    queryKey: ["veterinary-upcoming"],
    queryFn: fetchUpcomingTreatments,
  });
  const { data: livestock } = useQuery({ queryKey: ["livestock", ""], queryFn: () => fetchLivestock("") });
  const { data: items } = useQuery({ queryKey: ["inventory", ""], queryFn: () => fetchInventory("") });

  const createMutation = useMutation({
    mutationFn: recordTreatment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinary-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dosage = form.get("dosage_quantity") as string;
    const medicineId = form.get("medicine_item_id") as string;
    createMutation.mutate({
      livestock_id: form.get("livestock_id") as string,
      treatment_type: form.get("treatment_type") as TreatmentCreate["treatment_type"],
      diagnosis: form.get("diagnosis") as string,
      treatment_date: form.get("treatment_date") as string,
      follow_up_date: (form.get("follow_up_date") as string) || null,
      dosage_quantity: dosage ? dosage : null,
      medicine_item_id: medicineId || null,
      veterinarian: form.get("veterinarian") as string,
    } as TreatmentCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-ink">Veterinary</h1>
        <button onClick={() => setShowForm(true)} className="bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900">
          Record treatment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-line p-4">
        <p className="text-sm font-semibold text-ink mb-3">Upcoming follow-ups</p>
        {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}
        {upcoming?.length === 0 && <p className="text-sm text-ink-muted">No follow-ups scheduled.</p>}
        <div className="divide-y divide-line/60">
          {upcoming?.map((t) => (
            <div key={t.id} className="py-2 text-sm flex justify-between">
              <span className="text-ink">{t.treatment_type} — {t.diagnosis ?? "no diagnosis noted"}</span>
              <span className="font-mono text-gold-700">{t.follow_up_date}</span>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Record treatment</h2>
            <select name="livestock_id" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Select animal</option>
              {livestock?.map((a) => <option key={a.id} value={a.id}>{a.tag_number} — {a.species}</option>)}
            </select>
            <select name="treatment_type" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Treatment type</option>
              <option value="DEWORMING">Deworming</option>
              <option value="VACCINATION">Vaccination</option>
              <option value="ANTIBIOTIC">Antibiotic</option>
              <option value="OTHER">Other</option>
            </select>
            <input name="diagnosis" placeholder="Diagnosis" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />

            <select name="medicine_item_id" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Medicine used (optional)</option>
              {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input name="dosage_quantity" type="number" step="0.01" placeholder="Dosage quantity used" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />

            <label className="text-xs text-ink-muted">Treatment date</label>
            <input name="treatment_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-ink-muted">Follow-up date (optional)</label>
            <input name="follow_up_date" type="date" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="veterinarian" placeholder="Veterinarian" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />

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
