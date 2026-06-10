import { NextResponse } from "next/server";
import { createLot, getLots } from "@/lib/data";

export async function GET() {
  const lots = await getLots();
  return NextResponse.json({ lots });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createLot(body);
  return NextResponse.json(result);
}
