import { NextResponse } from "next/server";

import { isTrustedMutation } from "@/lib/origin";
import { jsonHeaders } from "@/lib/securityHeaders";
import {
  STATS_COOKIE,
  isValidStatsPassword,
  statsCookieValue,
  statsPasswordConfigured,
} from "@/lib/statsAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: jsonHeaders() },
    );
  }
  if (!statsPasswordConfigured()) {
    return NextResponse.json(
      { error: "unavailable" },
      { status: 503, headers: jsonHeaders() },
    );
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: jsonHeaders() },
    );
  }

  if (!isValidStatsPassword(payload?.password)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: jsonHeaders() },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: jsonHeaders() });
  response.cookies.set(STATS_COOKIE, statsCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
