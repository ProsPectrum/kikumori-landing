import "server-only";

import { NextResponse } from "next/server";

import { trackEvent } from "./analytics.js";
import { getDestinationUrl } from "./destination.js";
import { enforceRateLimit } from "./rateLimit.js";
import { consumeRedirectToken } from "./redirectTokens.js";
import { getClientIp } from "./requestIp.js";
import { SECURITY_HEADERS } from "./securityHeaders.js";

function errorResponse(status) {
  return new NextResponse(null, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      "Cache-Control": "no-store",
    },
  });
}

export async function redeemRedirectToken(request, token) {
  const ip = getClientIp(request);
  const limited = await enforceRateLimit({
    key: `r:${ip}`,
    limit: Number(process.env.REDIRECT_RATE_LIMIT || 30),
    windowSeconds: 60,
  });

  if (!limited.allowed) {
    return errorResponse(429);
  }

  const consumed = await consumeRedirectToken(token);
  // Mark used before the 302 so a replay cannot follow the same token.

  if (consumed.status === "missing") return errorResponse(404);
  if (consumed.status === "used") return errorResponse(410);
  if (consumed.status === "expired") return errorResponse(403);
  if (consumed.status !== "ok") return errorResponse(403);

  let destination;
  try {
    destination = getDestinationUrl(consumed.blockId);
  } catch {
    return errorResponse(503);
  }
  if (!destination) return errorResponse(503);

  const userAgent = request.headers.get("user-agent") || "";
  await trackEvent({
    event: "outbound_redirect",
    blockId: consumed.blockId,
    userAgent,
    source: "",
    campaign: "",
  });

  return new NextResponse(null, {
    status: 302,
    headers: {
      ...SECURITY_HEADERS,
      Location: destination,
      "Cache-Control": "no-store",
    },
  });
}
