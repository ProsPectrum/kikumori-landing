import "server-only";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token, ip) {
  if (!token || typeof token !== "string" || token.length > 4096) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, errorCodes: ["missing-secret"] };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return { success: false, errorCodes: ["siteverify-http-error"] };
  }

  const data = await response.json();
  return {
    success: data?.success === true,
    errorCodes: Array.isArray(data?.["error-codes"]) ? data["error-codes"] : [],
  };
}
