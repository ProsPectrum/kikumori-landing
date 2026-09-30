import { redeemRedirectToken } from "@/lib/redeemRedirect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { token } = await params;
  return redeemRedirectToken(request, token);
}
