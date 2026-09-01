import { api } from "./api";
import type { components } from "./api-types";

export type Field = components["schemas"]["FieldOut"];
export type FieldCreate = components["schemas"]["FieldCreate"];
export type Crop = components["schemas"]["CropOut"];
export type CropCreate = components["schemas"]["CropCreate"];
export type CropActivity = components["schemas"]["CropActivityOut"];
export type CropActivityCreate = components["schemas"]["CropActivityCreate"];
export type Harvest = components["schemas"]["HarvestOut"];
export type HarvestCreate = components["schemas"]["HarvestCreate"];

export async function fetchFields() {
  const res = await api.get<Field[]>("/crops/fields");
  return res.data;
}

export async function createField(payload: FieldCreate) {
  const res = await api.post<Field>("/crops/fields", payload);
  return res.data;
}

export async function fetchCrops(fieldId?: string) {
  const res = await api.get<Crop[]>("/crops", { params: fieldId ? { field_id: fieldId } : {} });
  return res.data;
}

export async function createCrop(payload: CropCreate) {
  const res = await api.post<Crop>("/crops", payload);
  return res.data;
}

export async function fetchActivities(cropId: string) {
  const res = await api.get<CropActivity[]>(`/crops/${cropId}/activities`);
  return res.data;
}

export async function recordActivity(cropId: string, payload: CropActivityCreate) {
  const res = await api.post<CropActivity>(`/crops/${cropId}/activities`, payload);
  return res.data;
}

export async function fetchHarvests(cropId: string) {
  const res = await api.get<Harvest[]>(`/crops/${cropId}/harvests`);
  return res.data;
}

export async function recordHarvest(cropId: string, payload: HarvestCreate) {
  const res = await api.post<Harvest>(`/crops/${cropId}/harvests`, payload);
  return res.data;
}

export async function completeCrop(cropId: string) {
  const res = await api.post<Crop>(`/crops/${cropId}/complete`);
  return res.data;
}
