import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { trackEvent } from "@/lib/analytics";
import { EXCLUSIVE_BLOCK_ID } from "@/lib/publicProfile";
import { isTrustedMutation } from "@/lib/origin";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import { jsonHeaders } from "@/lib/securityHeaders";
import { SOURCE_COOKIE, isKnownSourceId } from "@/lib/trafficSources";
import { processHumanVerification } from "@/lib/verifyHuman";

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
    key: `verify:${ip}`,
    limit: Number(process.env.VERIFY_RATE_LIMIT || 10),
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

  const token = payload?.token;
  const blockId = payload?.blockId || EXCLUSIVE_BLOCK_ID;
  const userAgent = request.headers.get("user-agent") || "";

  if (!token) {
    await trackEvent({
      event: "turnstile_failed",
      blockId,
      userAgent,
    });
    return NextResponse.json(
      { error: "missing_token" },
      { status: 400, headers: jsonHeaders() },
    );
  }

  const jar = await cookies();
  const sourceId = isKnownSourceId(jar.get(SOURCE_COOKIE)?.value)
    ? jar.get(SOURCE_COOKIE).value
    : "";

  const result = await processHumanVerification({
    token,
    blockId,
    ip,
    sourceId,
  });
  if (result.status !== 200) {
    await trackEvent({
      event: "turnstile_failed",
      blockId,
      userAgent,
    });
  }

  return NextResponse.json(result.body, {
    status: result.status,
    headers: jsonHeaders(),
  });
}

export async function GET() {
  return NextResponse.json(
    { error: "method_not_allowed" },
    { status: 405, headers: jsonHeaders() },
  );
}
