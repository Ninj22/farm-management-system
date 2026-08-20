import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUpcomingTreatments, recordTreatment } from "../lib/veterinary";
import type { TreatmentCreate } from "../lib/veterinary";

export default function Veterinary() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: upcoming, isLoading } = useQuery({
    queryKey: ["veterinary-upcoming"],
    queryFn: fetchUpcomingTreatments,
  });

  const createMutation = useMutation({
    mutationFn: recordTreatment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinary-upcoming"] });
      setShowForm(false);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dosage = form.get("dosage_quantity") as string;
    createMutation.mutate({
      livestock_id: form.get("livestock_id") as string,
      treatment_type: form.get("treatment_type") as TreatmentCreate["treatment_type"],
      diagnosis: form.get("diagnosis") as string,
      treatment_date: form.get("treatment_date") as string,
      follow_up_date: (form.get("follow_up_date") as string) || null,
      dosage_quantity: dosage ? dosage : null,
      medicine_item_id: (form.get("medicine_item_id") as string) || null,
      veterinarian: form.get("veterinarian") as string,
    } as TreatmentCreate);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Veterinary</h1>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white text-sm px-4 py-2 rounded">
          Record treatment
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium mb-3">Upcoming follow-ups</p>
        {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
        {upcoming?.length === 0 && <p className="text-sm text-gray-400">No follow-ups scheduled.</p>}
        <div className="divide-y divide-gray-100">
          {upcoming?.map((t) => (
            <div key={t.id} className="py-2 text-sm flex justify-between">
              <span>{t.treatment_type} — {t.diagnosis ?? "no diagnosis noted"}</span>
              <span className="text-amber-700">{t.follow_up_date}</span>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold mb-2">Record treatment</h2>
            <input name="livestock_id" placeholder="Livestock ID" required className="w-full border rounded px-3 py-2 text-sm" />
            <select name="treatment_type" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Treatment type</option>
              <option value="DEWORMING">Deworming</option>
              <option value="VACCINATION">Vaccination</option>
              <option value="ANTIBIOTIC">Antibiotic</option>
              <option value="OTHER">Other</option>
            </select>
            <input name="diagnosis" placeholder="Diagnosis" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="medicine_item_id" placeholder="Medicine inventory item ID (optional)" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="dosage_quantity" type="number" step="0.01" placeholder="Dosage quantity used" className="w-full border rounded px-3 py-2 text-sm" />
            <label className="text-xs text-gray-500">Treatment date</label>
            <input name="treatment_date" type="date" required className="w-full border rounded px-3 py-2 text-sm" />
            <label className="text-xs text-gray-500">Follow-up date (optional)</label>
            <input name="follow_up_date" type="date" className="w-full border rounded px-3 py-2 text-sm" />
            <input name="veterinarian" placeholder="Veterinarian" className="w-full border rounded px-3 py-2 text-sm" />
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
