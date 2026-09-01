import { api } from "./api";
import type { components } from "./api-types";

export type ProductionRecord = components["schemas"]["ProductionOut"];
export type ProductionCreate = components["schemas"]["ProductionCreate"];

export async function fetchProduction(farmId?: string) {
  const res = await api.get<ProductionRecord[]>("/production", { params: farmId ? { farm_id: farmId } : {} });
  return res.data;
}

export async function recordProduction(payload: ProductionCreate) {
  const res = await api.post<ProductionRecord>("/production", payload);
  return res.data;
}
