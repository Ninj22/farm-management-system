import { api } from "./api";

export interface DashboardSummary {
  total_livestock: number;
  low_stock_count: number;
  upcoming_treatments_count: number;
  inventory_value: string;
}

export async function fetchDashboardSummary() {
  const res = await api.get<DashboardSummary>("/dashboard/summary");
  return res.data;
}
