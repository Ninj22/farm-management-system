import { api } from "./api";
import type { components } from "./api-types";

export type Task = components["schemas"]["TaskOut"];
export type TaskCreate = components["schemas"]["TaskCreate"];
export type TaskStatusUpdate = components["schemas"]["TaskStatusUpdate"];

export async function fetchTasks(status?: string) {
  const res = await api.get<Task[]>("/tasks", { params: status ? { status } : {} });
  return res.data;
}

export async function fetchMyTasks(status?: string) {
  const res = await api.get<Task[]>("/tasks/mine", { params: status ? { status } : {} });
  return res.data;
}

export async function createTask(payload: TaskCreate) {
  const res = await api.post<Task>("/tasks", payload);
  return res.data;
}

export async function updateTaskStatus(taskId: string, payload: TaskStatusUpdate) {
  const res = await api.patch<Task>(`/tasks/${taskId}/status`, payload);
  return res.data;
}
