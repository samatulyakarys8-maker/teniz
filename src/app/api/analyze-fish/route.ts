import { NextResponse } from "next/server";
import { analyzeFishPhoto } from "@/lib/gemini";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("photo");
  const result = await analyzeFishPhoto(file instanceof File ? file : null);
  return NextResponse.json(result);
}
