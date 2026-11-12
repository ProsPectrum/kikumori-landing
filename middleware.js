import { NextResponse } from "next/server";

import { SECURITY_HEADERS } from "./lib/securityHeaders";
import { SOURCE_COOKIE, sourceIdFromPathname } from "./lib/trafficSources";

function randomSessionId() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function middleware(request) {
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  const sourceId = sourceIdFromPathname(request.nextUrl.pathname);
  if (sourceId) {
    response.cookies.set(SOURCE_COOKIE, sourceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (!request.cookies.get("kiku_sid")) {
    response.cookies.set("kiku_sid", randomSessionId(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
