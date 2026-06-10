import { NextResponse } from "next/server";
import { createCatch } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createCatch(body);
  return NextResponse.json(result);
}
