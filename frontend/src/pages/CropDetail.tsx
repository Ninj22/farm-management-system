import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCrops, fetchActivities, recordActivity, fetchHarvests, recordHarvest, completeCrop,
} from "../lib/crops";
import type { CropActivityCreate, HarvestCreate } from "../lib/crops";
import { fetchInventory } from "../lib/inventory";
import StatusBadge from "../components/StatusBadge";

export default function CropDetail() {
  const { cropId } = useParams<{ cropId: string }>();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: crops } = useQuery({ queryKey: ["crops"], queryFn: () => fetchCrops() });
  const crop = crops?.find((c) => c.id === cropId);

  const { data: activities } = useQuery({
    queryKey: ["crop-activities", cropId],
    queryFn: () => fetchActivities(cropId!),
    enabled: !!cropId,
  });
  const { data: harvests } = useQuery({
    queryKey: ["crop-harvests", cropId],
    queryFn: () => fetchHarvests(cropId!),
    enabled: !!cropId,
  });
  const { data: items } = useQuery({ queryKey: ["inventory", ""], queryFn: () => fetchInventory("") });

  const activityMutation = useMutation({
    mutationFn: (payload: CropActivityCreate) => recordActivity(cropId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crop-activities", cropId] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowActivityForm(false);
    },
  });

  const harvestMutation = useMutation({
    mutationFn: (payload: HarvestCreate) => recordHarvest(cropId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crop-harvests", cropId] });
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowHarvestForm(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => completeCrop(cropId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crops"] }),
  });

  function handleActivitySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const inputItemId = form.get("input_item_id") as string;
    activityMutation.mutate({
      activity_type: form.get("activity_type") as CropActivityCreate["activity_type"],
      activity_date: form.get("activity_date") as string,
      input_item_id: inputItemId || undefined,
      quantity_used: (form.get("quantity_used") as string) || undefined,
      notes: form.get("notes") as string,
    });
  }

  function handleHarvestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const produceItemId = form.get("produce_inventory_item_id") as string;
    harvestMutation.mutate({
      harvest_date: form.get("harvest_date") as string,
      quantity: form.get("quantity") as string,
      unit: form.get("unit") as string,
      produce_inventory_item_id: produceItemId || undefined,
    } as HarvestCreate);
  }

  if (!crop) return <p className="text-sm text-ink-muted">Loading...</p>;

  const totalHarvested = harvests?.reduce((sum, h) => sum + Number(h.quantity), 0) ?? 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {crop.crop_type}{crop.variety ? ` — ${crop.variety}` : ""}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={crop.status} />
            <span className="text-xs text-ink-muted">Planted {crop.planting_date ?? "—"}</span>
          </div>
        </div>
        {crop.status !== "COMPLETED" && (
          <button
            onClick={() => completeMutation.mutate()}
            className="text-sm text-ink-muted border border-line rounded-lg px-3 py-1.5 hover:bg-paper"
          >
            Mark cycle complete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-line p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-ink">Activities</p>
            <button onClick={() => setShowActivityForm(true)} className="text-xs text-plum-800 font-medium hover:underline">
              + Log activity
            </button>
          </div>
          {activities && activities.length > 0 ? (
            <div className="divide-y divide-line/60">
              {activities.map((a) => (
                <div key={a.id} className="py-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink">{a.activity_type}</span>
                    <span className="font-mono text-xs text-ink-muted">{a.activity_date}</span>
                  </div>
                  {a.notes && <p className="text-xs text-ink-muted mt-0.5">{a.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No activities logged yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-line p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-semibold text-ink">Harvests</p>
              {totalHarvested > 0 && <p className="text-xs text-ink-muted">Total: {totalHarvested}</p>}
            </div>
            <button onClick={() => setShowHarvestForm(true)} className="text-xs text-plum-800 font-medium hover:underline">
              + Log harvest
            </button>
          </div>
          {harvests && harvests.length > 0 ? (
            <div className="divide-y divide-line/60">
              {harvests.map((h) => (
                <div key={h.id} className="py-2 flex justify-between text-sm">
                  <span className="text-ink">{h.harvest_date}</span>
                  <span className="font-mono text-gold-700">{h.quantity} {h.unit}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No harvests recorded yet — supports multiple harvests from one planting.</p>
          )}
        </div>
      </div>

      {showActivityForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleActivitySubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Log activity</h2>
            <select name="activity_type" required className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Activity type</option>
              <option value="LAND_PREPARATION">Land preparation</option>
              <option value="PLANTING">Planting</option>
              <option value="FERTILIZATION">Fertilization</option>
              <option value="SPRAYING">Spraying</option>
              <option value="IRRIGATION">Irrigation</option>
              <option value="WEEDING">Weeding</option>
              <option value="OTHER">Other</option>
            </select>
            <input name="activity_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <select name="input_item_id" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Input used (optional)</option>
              {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input name="quantity_used" type="number" step="0.01" placeholder="Quantity used" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <input name="notes" placeholder="Notes" className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowActivityForm(false)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}

      {showHarvestForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <form onSubmit={handleHarvestSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-semibold text-ink mb-2">Log harvest</h2>
            <input name="harvest_date" type="date" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input name="quantity" type="number" step="0.01" placeholder="Quantity" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
              <input name="unit" placeholder="Unit (kg, bags...)" required className="w-full border border-line rounded-lg px-3 py-2 text-sm" />
            </div>
            <select name="produce_inventory_item_id" className="w-full border border-line rounded-lg px-3 py-2 text-sm">
              <option value="">Add to inventory item (optional)</option>
              {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowHarvestForm(false)} className="px-4 py-2 text-sm text-ink-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-plum-800 text-white rounded-lg hover:bg-plum-900">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
