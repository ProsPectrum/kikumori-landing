import { NextResponse } from "next/server";

import { STATS_COOKIE } from "@/lib/statsAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/stats", request.url), 303);
  response.cookies.set(STATS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
