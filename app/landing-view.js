import { headers } from "next/headers";

import CreatorProfile from "@/components/CreatorProfile";
import { trackEvent } from "@/lib/analytics";
import { EXCLUSIVE_BLOCK_ID, getCreatorProfile, getPublicSocialLinks } from "@/lib/publicProfile";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/requestIp";
import { recordPageView } from "@/lib/stats";
import { isKnownSourceId } from "@/lib/trafficSources";

export async function LandingView({ sourceId = "", recordView = false }) {
  const headerList = await headers();
  const safeSource = isKnownSourceId(sourceId) ? sourceId : "";

  if (recordView && safeSource) {
    const ip = getClientIp({ headers: headerList });
    const limited = await enforceRateLimit({
      key: `src:${ip}`,
      limit: 60,
      windowSeconds: 60,
    });
    if (limited.allowed) {
      await recordPageView(safeSource);
    }
  }

  await trackEvent({
    event: "landing_view",
    source: safeSource,
    campaign: "",
    userAgent: headerList.get("user-agent") || "",
  });

  const origin = (process.env.SITE_URL || "").replace(/\/$/, "");
  const shareUrl = safeSource && origin ? `${origin}/s/${safeSource}` : "";

  return (
    <CreatorProfile
      creator={getCreatorProfile(safeSource)}
      socials={getPublicSocialLinks(safeSource)}
      exclusiveBlockId={EXCLUSIVE_BLOCK_ID}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
      sourceId={safeSource}
      shareUrl={shareUrl}
    />
  );
}
