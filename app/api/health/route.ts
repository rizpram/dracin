import { NextResponse } from "next/server";
import { getProviderCacheStats } from "@/lib/provider-cache";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "dracin",
    cache: getProviderCacheStats(),
    timestamp: new Date().toISOString(),
  });
}
