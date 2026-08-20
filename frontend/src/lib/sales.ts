import { api } from "./api";
import type { components } from "./api-types";

export type Sale = components["schemas"]["SaleOut"];
export type SaleCreate = components["schemas"]["SaleCreate"];
export type Customer = components["schemas"]["CustomerOut"];

export async function fetchSales() {
  const res = await api.get<Sale[]>("/sales");
  return res.data;
}

export async function fetchCustomers() {
  const res = await api.get<Customer[]>("/customers");
  return res.data;
}

export async function createSale(payload: SaleCreate) {
  const res = await api.post<Sale>("/sales", payload);
  return res.data;
}
