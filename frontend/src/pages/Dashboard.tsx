import { useQuery } from "@tanstack/react-query";
import { PawPrint, AlertTriangle, Stethoscope, Coins } from "lucide-react";
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
    select: (items) => items.filter((i) => Number(i.quantity_on_hand) <= 0 || true),
  });

  const { data: upcoming } = useQuery({
    queryKey: ["veterinary-upcoming"],
    queryFn: fetchUpcomingTreatments,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of farm operations</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total livestock"
          value={isLoading ? "…" : summary?.total_livestock ?? 0}
          icon={PawPrint}
        />
        <StatCard
          label="Low stock items"
          value={isLoading ? "…" : summary?.low_stock_count ?? 0}
          tone="warning"
          icon={AlertTriangle}
        />
        <StatCard
          label="Upcoming treatments"
          value={isLoading ? "…" : summary?.upcoming_treatments_count ?? 0}
          tone="danger"
          icon={Stethoscope}
        />
        <StatCard
          label="Inventory value"
          value={isLoading ? "…" : `KES ${Number(summary?.inventory_value ?? 0).toLocaleString()}`}
          tone="success"
          icon={Coins}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-900 mb-3">Low stock items</p>
          {lowStock && lowStock.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {lowStock.slice(0, 6).map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-900">{item.name}</span>
                  <span className="text-amber-700 font-medium">{item.quantity_on_hand} {item.unit}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nothing running low right now.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-900 mb-3">Upcoming follow-ups</p>
          {upcoming && upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-start gap-2 text-sm">
                  <Stethoscope size={14} className="mt-0.5 text-amber-600" />
                  <div>
                    <p className="text-gray-900">{t.treatment_type}</p>
                    <p className="text-xs text-gray-500">{t.follow_up_date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No follow-ups scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
