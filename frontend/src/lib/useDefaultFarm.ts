import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { components } from "./api-types";

type Farm = components["schemas"]["FarmOut"];

async function fetchFarms() {
  const res = await api.get<Farm[]>("/farms");
  return res.data;
}

/**
 * Most farms using this system have exactly one Farm record. This hook fetches
 * the accessible farms and returns the single one automatically when there's
 * only one — so forms never need to show a farm_id field at all in the common
 * case. If there's genuinely more than one, `farms` is returned so the caller
 * can render a real dropdown instead.
 */
export function useDefaultFarm() {
  const { data: farms, isLoading } = useQuery({ queryKey: ["farms"], queryFn: fetchFarms });
  const singleFarm = farms && farms.length === 1 ? farms[0] : null;
  return { farms, singleFarm, isLoading, hasMultipleFarms: (farms?.length ?? 0) > 1 };
}
