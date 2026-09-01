import { api } from "./api";
import type { components } from "./api-types";

export type InventoryItem = components["schemas"]["InventoryItemOut"];

export interface InternalUsePayload {
  quantity: string;
  used_for: string;
  livestock_id?: string;
  notes?: string;
}

export async function recordInternalUse(itemId: string, payload: InternalUsePayload) {
  const res = await api.post<InventoryItem>(`/internal-use/${itemId}`, payload);
  return res.data;
}
