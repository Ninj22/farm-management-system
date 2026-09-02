import { api } from "./api";
import type { components } from "./api-types";

export type User = components["schemas"]["UserOut"];

export async function fetchUsers() {
  const res = await api.get<User[]>("/auth/users");
  return res.data;
}

export async function deactivateUser(id: string) {
  const res = await api.patch<User>(`/auth/users/${id}/deactivate`);
  return res.data;
}

export async function activateUser(id: string) {
  const res = await api.patch<User>(`/auth/users/${id}/activate`);
  return res.data;
}

export type UserCreate = components["schemas"]["UserCreate"];

export async function registerUser(payload: UserCreate) {
  const res = await api.post<User>("/auth/register", payload);
  return res.data;
}
