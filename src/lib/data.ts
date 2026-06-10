import { unstable_noStore as noStore } from "next/cache";
import {
  activeLotsWithDetails,
  demoCatches,
  demoLots,
  demoQuotas,
  demoUsers,
  demoZones,
} from "./demo-data";
import { supabaseAdmin, supabaseAnon } from "./supabase";
import type { Catch, Lot, LotWithDetails, Passport } from "./types";

export async function getLots(): Promise<LotWithDetails[]> {
  noStore();
  const supabase = supabaseAnon();
  if (!supabase) return activeLotsWithDetails();

  const { data: lots, error: lotsError } = await supabase
    .from("lots")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (lotsError || !lots) return activeLotsWithDetails();

  const catchIds = lots.map((lot) => lot.catch_id);
  const fishermanIds = lots.map((lot) => lot.fisherman_id);
  const [{ data: catches }, { data: users }] = await Promise.all([
    supabase.from("catches").select("*").in("id", catchIds),
    supabase.from("users").select("*").in("id", fishermanIds),
  ]);

  const detailed = lots
    .map((lot) => {
      const catchItem = catches?.find((item) => item.id === lot.catch_id);
      const fisherman = users?.find((user) => user.id === lot.fisherman_id);
      return catchItem && fisherman
        ? ({ ...lot, catch: catchItem, fisherman } as LotWithDetails)
        : null;
    })
    .filter(Boolean) as LotWithDetails[];

  return detailed.length ? detailed : activeLotsWithDetails();
}

export async function getDashboardData() {
  noStore();
  const supabase = supabaseAnon();
  if (!supabase) {
    return {
      users: demoUsers,
      catches: demoCatches,
      lots: demoLots,
      quotas: demoQuotas,
      zones: demoZones,
      demo: true,
    };
  }

  const [users, catches, lots, quotas, zones] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("catches").select("*").order("created_at", { ascending: false }),
    supabase.from("lots").select("*"),
    supabase.from("quotas").select("*"),
    supabase.from("zones").select("*"),
  ]);

  if (catches.error || quotas.error || zones.error) {
    return {
      users: demoUsers,
      catches: demoCatches,
      lots: demoLots,
      quotas: demoQuotas,
      zones: demoZones,
      demo: true,
    };
  }

  return {
    users: users.data ?? demoUsers,
    catches: catches.data ?? demoCatches,
    lots: lots.data ?? demoLots,
    quotas: quotas.data ?? demoQuotas,
    zones: zones.data ?? demoZones,
    demo: false,
  };
}

export async function getPassport(qrId: string): Promise<Passport | null> {
  noStore();
  const supabase = supabaseAnon();
  if (!supabase) {
    const catchItem = demoCatches.find((item) => item.qr_code === qrId);
    const fisherman = catchItem
      ? demoUsers.find((user) => user.id === catchItem.fisherman_id)
      : null;
    return catchItem && fisherman ? { ...catchItem, fisherman } : null;
  }

  const { data, error } = await supabase
    .from("catches")
    .select("*, fisherman:users(*)")
    .eq("qr_code", qrId)
    .maybeSingle();

  if (error || !data) return getPassportFromDemo(qrId);
  return data as Passport;
}

function getPassportFromDemo(qrId: string) {
  const catchItem = demoCatches.find((item) => item.qr_code === qrId);
  const fisherman = catchItem
    ? demoUsers.find((user) => user.id === catchItem.fisherman_id)
    : null;
  return catchItem && fisherman ? { ...catchItem, fisherman } : null;
}

export async function createCatch(payload: Partial<Catch>) {
  const supabase = supabaseAdmin() ?? supabaseAnon();
  const catchItem: Catch = {
    id: payload.id ?? crypto.randomUUID(),
    fisherman_id: payload.fisherman_id ?? "00000000-0000-0000-0000-000000000001",
    fish_type: payload.fish_type ?? "сазан",
    weight_kg: Number(payload.weight_kg ?? 0),
    size_cm: Number(payload.size_cm ?? 0),
    photo_url: payload.photo_url ?? "/fish-demo.svg",
    latitude: Number(payload.latitude ?? 43.65),
    longitude: Number(payload.longitude ?? 51.16),
    is_legal: Boolean(payload.is_legal),
    ai_verdict: payload.ai_verdict ?? null,
    quota_used: Number(payload.quota_used ?? 0),
    qr_code: payload.qr_code ?? `TNZ-${Date.now().toString(36).toUpperCase()}`,
    created_at: payload.created_at ?? new Date().toISOString(),
  };

  if (!supabase) return { catch: catchItem, demo: true };

  const { data, error } = await supabase
    .from("catches")
    .insert(catchItem)
    .select("*")
    .single();

  if (error || !data) return { catch: catchItem, demo: true };
  return { catch: data as Catch, demo: false };
}

export async function createLot(payload: Partial<Lot>) {
  const supabase = supabaseAdmin() ?? supabaseAnon();
  const lot: Lot = {
    id: payload.id ?? crypto.randomUUID(),
    catch_id: payload.catch_id ?? "",
    fisherman_id: payload.fisherman_id ?? "00000000-0000-0000-0000-000000000001",
    price_per_kg: Number(payload.price_per_kg ?? 0),
    weight_kg: Number(payload.weight_kg ?? 0),
    status: payload.status ?? "active",
    buyer_id: payload.buyer_id ?? null,
    created_at: payload.created_at ?? new Date().toISOString(),
  };

  if (!supabase) return { lot, demo: true };

  const { data, error } = await supabase.from("lots").insert(lot).select("*").single();
  if (error || !data) return { lot, demo: true };
  return { lot: data as Lot, demo: false };
}
