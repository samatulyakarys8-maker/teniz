export type UserRole = "fisherman" | "buyer" | "inspector";
export type FishType = "сазан" | "вобла" | "осётр" | "судак" | "другое";
export type LotStatus = "active" | "sold";

export type TenizUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at: string;
};

export type Catch = {
  id: string;
  fisherman_id: string;
  fish_type: FishType;
  weight_kg: number;
  size_cm: number;
  photo_url: string;
  latitude: number;
  longitude: number;
  is_legal: boolean;
  ai_verdict: FishAiVerdict | null;
  quota_used: number;
  qr_code: string;
  created_at: string;
};

export type Lot = {
  id: string;
  catch_id: string;
  fisherman_id: string;
  price_per_kg: number;
  weight_kg: number;
  status: LotStatus;
  buyer_id: string | null;
  created_at: string;
};

export type Quota = {
  id: string;
  fish_type: FishType;
  total_kg: number;
  used_kg: number;
  season_year: number;
};

export type Zone = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk_level: number;
};

export type FishAiVerdict = {
  "вид": FishType;
  "размер_см": number;
  "законно": boolean;
  "вердикт": "МОЖНО ПРОДАВАТЬ" | "НУЖНО ОТПУСТИТЬ";
  "причина": string;
};

export type AnomalyVerdict = {
  "риск": number;
  "флаг": boolean;
  "причина": string;
};

export type LotWithDetails = Lot & {
  catch: Catch;
  fisherman: TenizUser;
};

export type Passport = Catch & {
  fisherman: TenizUser;
};
