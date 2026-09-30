import { NextResponse } from "next/server";

import { ALLOWED_EVENTS } from "@/lib/eventNames";
import { trackEvent } from "@/lib/analytics";
import { isTrustedMutation } from "@/lib/origin";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import { jsonHeaders } from "@/lib/securityHeaders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: jsonHeaders() },
    );
  }

  const ip = getClientIp(request);
  const limited = await enforceRateLimit({
    key: `analytics:${ip}`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: jsonHeaders() },
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

  if (!ALLOWED_EVENTS.has(payload?.event) || payload.event === "outbound_redirect") {
    return NextResponse.json(
      { error: "invalid_event" },
      { status: 400, headers: jsonHeaders() },
    );
  }

  await trackEvent({
    event: payload.event,
    source: payload.source,
    campaign: payload.campaign,
    blockId: payload.blockId,
    socialId: payload.socialId,
    userAgent: request.headers.get("user-agent") || "",
  });

  return NextResponse.json({ ok: true }, { headers: jsonHeaders() });
}
