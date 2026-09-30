import { NextResponse } from "next/server";

import { jsonHeaders } from "@/lib/securityHeaders";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "not_found" },
    { status: 404, headers: jsonHeaders() },
  );
}
