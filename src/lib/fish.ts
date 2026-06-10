import type { FishType } from "./types";

export const fishTypes: FishType[] = ["сазан", "вобла", "судак", "осётр", "другое"];

export const fishMinimumSizes: Record<FishType, number> = {
  "осётр": 60,
  "сазан": 40,
  "вобла": 17,
  "судак": 38,
  "другое": 0,
};

export const fishBadgeClasses: Record<FishType, string> = {
  "сазан": "border-amber-400/30 bg-amber-400/15 text-amber-100",
  "вобла": "border-sky-300/30 bg-sky-300/15 text-sky-100",
  "судак": "border-emerald-300/30 bg-emerald-300/15 text-emerald-100",
  "осётр": "border-fuchsia-300/30 bg-fuchsia-300/15 text-fuchsia-100",
  "другое": "border-slate-300/30 bg-slate-300/15 text-slate-100",
};

export function checkLegality(fishType: FishType, sizeCm: number) {
  const minimum = fishMinimumSizes[fishType] ?? 0;
  const legal = sizeCm >= minimum;
  return {
    legal,
    reason: legal
      ? `${fishType}: размер ${sizeCm} см соответствует минимуму ${minimum} см.`
      : `${fishType}: размер ${sizeCm} см меньше разрешенного минимума ${minimum} см.`,
  };
}

export function riskColor(risk: number) {
  if (risk >= 8) return "#ef4444";
  if (risk >= 5) return "#eab308";
  return "#22c55e";
}

export function riskLabel(risk: number) {
  if (risk >= 8) return "Тревога";
  if (risk >= 5) return "Под наблюдением";
  return "Норма";
}

export function formatTenge(value: number) {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earth = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
