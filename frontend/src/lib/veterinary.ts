import { api } from "./api";
import type { components } from "./api-types";

export type Treatment = components["schemas"]["TreatmentOut"];
export type TreatmentCreate = components["schemas"]["TreatmentCreate"];

export async function fetchUpcomingTreatments() {
  const res = await api.get<Treatment[]>("/veterinary/upcoming");
  return res.data;
}

export async function recordTreatment(payload: TreatmentCreate) {
  const res = await api.post<Treatment>("/veterinary", payload);
  return res.data;
}
