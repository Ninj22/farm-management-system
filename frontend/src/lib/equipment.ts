import { api } from "./api";
import type { components } from "./api-types";

export type Equipment = components["schemas"]["EquipmentOut"];
export type EquipmentCreate = components["schemas"]["EquipmentCreate"];
export type MaintenanceRecordCreate = components["schemas"]["MaintenanceRecordCreate"];

export async function fetchEquipment(search: string) {
  const res = await api.get<Equipment[]>("/equipment", { params: { search } });
  return res.data;
}

export async function createEquipment(payload: EquipmentCreate) {
  const res = await api.post<Equipment>("/equipment", payload);
  return res.data;
}

export async function recordMaintenance(equipmentId: string, payload: MaintenanceRecordCreate) {
  const res = await api.post<Equipment>(`/equipment/${equipmentId}/maintenance`, payload);
  return res.data;
}
