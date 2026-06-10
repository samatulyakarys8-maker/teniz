import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data";
import { detectAnomaly } from "@/lib/gemini";
import type { Catch, Quota, Zone } from "@/lib/types";

export async function GET() {
  const dashboard = await getDashboardData();
  const catches = dashboard.catches as Catch[];
  const quotas = dashboard.quotas as Quota[];
  const zones = dashboard.zones as Zone[];

  const alerts = await Promise.all(
    catches.slice(0, 5).map(async (catchItem) => {
      const quota = quotas.find((item) => item.fish_type === catchItem.fish_type);
      const zoneAverage =
        catches.filter((item) => item.fish_type === catchItem.fish_type).reduce(
          (sum, item) => sum + item.weight_kg,
          0,
        ) / Math.max(1, catches.filter((item) => item.fish_type === catchItem.fish_type).length);
      const { anomaly } = await detectAnomaly({
        species: catchItem.fish_type,
        weight: catchItem.weight_kg,
        remainingQuota: quota ? quota.total_kg - quota.used_kg : 100,
        zoneAverage: Math.max(1, zoneAverage),
      });
      return { catch: catchItem, anomaly };
    }),
  );

  return NextResponse.json({ ...dashboard, zones, alerts });
}
