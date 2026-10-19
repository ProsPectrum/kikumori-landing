import { cookies, headers } from "next/headers";

import CreatorProfile from "@/components/CreatorProfile";
import { trackEvent } from "@/lib/analytics";
import { creator, EXCLUSIVE_BLOCK_ID, getPublicSocialLinks } from "@/lib/publicProfile";
import { SOURCE_COOKIE, isKnownSourceId } from "@/lib/trafficSources";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const headerList = await headers();
  const jar = await cookies();
  const sourceId = isKnownSourceId(jar.get(SOURCE_COOKIE)?.value)
    ? jar.get(SOURCE_COOKIE).value
    : "";

  await trackEvent({
    event: "landing_view",
    source: sourceId || params.source || params.utm_source || "",
    campaign: params.campaign || params.utm_campaign || "",
    userAgent: headerList.get("user-agent") || "",
  });

  return (
    <CreatorProfile
      creator={creator}
      socials={getPublicSocialLinks(sourceId)}
      exclusiveBlockId={EXCLUSIVE_BLOCK_ID}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
    />
  );
}
