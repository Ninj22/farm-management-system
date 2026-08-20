// frontend/src/lib/inventory.ts — replace the hand-written interface
import { api } from "./api";
import type { components } from "./api-types";

export type InventoryItem = components["schemas"]["InventoryItemOut"];

export async function fetchInventory(search: string) {
  const res = await api.get<InventoryItem[]>("/inventory", { params: { search } });
  return res.data;
}
