import { api } from "./api";
import type { components } from "./api-types";

export type Expense = components["schemas"]["ExpenseOut"];
export type ExpenseCreate = components["schemas"]["ExpenseCreate"];

export async function fetchExpenses() {
  const res = await api.get<Expense[]>("/expenses");
  return res.data;
}

export async function createExpense(payload: ExpenseCreate) {
  const res = await api.post<Expense>("/expenses", payload);
  return res.data;
}
