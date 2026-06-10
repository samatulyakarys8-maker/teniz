import { NextResponse } from "next/server";
import { advisePrice } from "@/lib/gemini";
import { activeLotsWithDetails } from "@/lib/demo-data";
import type { FishType } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const species = body.species as FishType;
  const lots = activeLotsWithDetails().filter((lot) => lot.catch.fish_type === species);
  const average =
    lots.length > 0
      ? Math.round(
          lots.reduce((sum, lot) => sum + lot.price_per_kg, 0) / lots.length,
        )
      : Math.round(Number(body.price ?? 2800));

  const result = await advisePrice({
    species,
    weight: Number(body.weight ?? 0),
    price: Number(body.price ?? 0),
    avgPrices: `${species}: ${average}₸/кг`,
  });

  return NextResponse.json({ ...result, average });
}
