import { api } from "./api";
import type { components } from "./api-types";

export type Purchase = components["schemas"]["PurchaseOut"];
export type PurchaseCreate = components["schemas"]["PurchaseCreate"];
export type Supplier = components["schemas"]["SupplierOut"];

export async function fetchPurchases() {
  const res = await api.get<Purchase[]>("/purchases");
  return res.data;
}

export async function fetchSuppliers() {
  const res = await api.get<Supplier[]>("/suppliers");
  return res.data;
}

export async function createPurchase(payload: PurchaseCreate) {
  const res = await api.post<Purchase>("/purchases", payload);
  return res.data;
}
