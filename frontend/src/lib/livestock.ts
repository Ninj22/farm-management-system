import { api } from "./api";
import type { components } from "./api-types";

export type Livestock = components["schemas"]["LivestockOut"];
export type LivestockCreate = components["schemas"]["LivestockCreate"];

export async function fetchLivestock(search: string) {
  const res = await api.get<Livestock[]>("/livestock", { params: { search } });
  return res.data;
}

export async function createLivestock(payload: LivestockCreate) {
  const res = await api.post<Livestock>("/livestock", payload);
  return res.data;
}
