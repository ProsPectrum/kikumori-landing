import { NextResponse } from "next/server";

import { trackEvent } from "@/lib/analytics";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import { recordPageView } from "@/lib/stats";
import { SECURITY_HEADERS } from "@/lib/securityHeaders";
import { SOURCE_COOKIE, isKnownSourceId } from "@/lib/trafficSources";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function fail(status) {
  return new NextResponse(null, {
    status,
    headers: { ...SECURITY_HEADERS, "Cache-Control": "no-store" },
  });
}

export async function GET(request, { params }) {
  const { source } = await params;
  if (!isKnownSourceId(source)) return fail(404);

  const ip = getClientIp(request);
  const limited = await enforceRateLimit({
    key: `src:${ip}`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!limited.allowed) return fail(429);

  await recordPageView(source);
  await trackEvent({
    event: "landing_view",
    source,
    userAgent: request.headers.get("user-agent") || "",
  });

  const response = NextResponse.redirect(new URL("/", request.url), 302);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SOURCE_COOKIE, source, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
