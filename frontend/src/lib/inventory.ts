import { api } from "./api";
import type { components } from "./api-types";

export type InventoryItem = components["schemas"]["InventoryItemOut"];
export type InventoryItemCreate = components["schemas"]["InventoryItemCreate"];

export async function fetchInventory(search: string) {
  const res = await api.get<InventoryItem[]>("/inventory", { params: { search } });
  return res.data;
}

export async function createInventoryItem(payload: InventoryItemCreate) {
  const res = await api.post<InventoryItem>("/inventory", payload);
  return res.data;
}
