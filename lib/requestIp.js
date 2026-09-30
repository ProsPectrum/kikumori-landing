import "server-only";

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 128);

  return "unknown";
}
