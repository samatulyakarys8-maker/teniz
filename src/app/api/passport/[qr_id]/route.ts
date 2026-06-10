import { NextResponse } from "next/server";
import { getPassport } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: { qr_id: string } },
) {
  const passport = await getPassport(decodeURIComponent(params.qr_id));
  if (!passport) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ passport });
}
