import { api } from "./api";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity_on_hand: string;
  min_stock_level: string;
  purchase_price: string;
  selling_price: string | null;
}

export async function fetchInventory(search: string) {
  const res = await api.get<InventoryItem[]>("/inventory", { params: { search } });
  return res.data;
}

export async function createInventoryItem(payload: Partial<InventoryItem>) {
  const res = await api.post<InventoryItem>("/inventory", payload);
  return res.data;
}
