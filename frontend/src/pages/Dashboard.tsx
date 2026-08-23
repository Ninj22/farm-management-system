import { useQuery } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import StatCard from "../components/StatCard";
import { fetchDashboardSummary } from "../lib/dashboard";
import { fetchInventory } from "../lib/inventory";
import { api } from "../lib/api";

interface UpcomingTreatment {
  id: string;
  treatment_type: string;
  follow_up_date: string;
}

async function fetchUpcomingTreatments() {
  const res = await api.get<UpcomingTreatment[]>("/veterinary/upcoming");
  return res.data;
}

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  const { data: lowStock } = useQuery({
    queryKey: ["inventory-low-stock"],
    queryFn: () => fetchInventory(""),
  });

  const { data: upcoming } = useQuery({
    queryKey: ["veterinary-upcoming"],
    queryFn: fetchUpcomingTreatments,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Good morning</h1>
      <p className="mt-0.5 text-sm text-ink-muted">Here's what needs your attention across the farm.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total livestock" value={isLoading ? "…" : summary?.total_livestock ?? 0} tone="featured" />
        <StatCard
          label="Low stock items"
          value={isLoading ? "…" : summary?.low_stock_count ?? 0}
          tone="warning"
        />
        <StatCard
          label="Upcoming treatments"
          value={isLoading ? "…" : summary?.upcoming_treatments_count ?? 0}
          tone="danger"
        />
        <StatCard
          label="Inventory value"
          value={isLoading ? "…" : `KES ${Number(summary?.inventory_value ?? 0).toLocaleString()}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4 lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-ink">Inventory attention</p>
          {lowStock && lowStock.length > 0 ? (
            <div className="divide-y divide-line/60">
              {lowStock.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="text-ink">{item.name}</p>
                    <p className="text-xs text-ink-muted">{item.category}</p>
                  </div>
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs font-semibold text-amber-700">
                    {item.quantity_on_hand} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Nothing running low right now.</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-ink">Upcoming follow-ups</p>
          {upcoming && upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-start gap-2 text-sm">
                  <Stethoscope size={14} className="mt-0.5 text-gold-700" />
                  <div>
                    <p className="text-ink">{t.treatment_type}</p>
                    <p className="font-mono text-xs text-ink-muted">{t.follow_up_date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No follow-ups scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
