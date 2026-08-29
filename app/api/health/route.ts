import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "dracin",
    timestamp: new Date().toISOString()
  });
}
