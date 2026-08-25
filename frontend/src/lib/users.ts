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
