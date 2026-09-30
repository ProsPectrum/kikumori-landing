import { headers } from "next/headers";

import CreatorProfile from "@/components/CreatorProfile";
import { trackEvent } from "@/lib/analytics";
import { creator, EXCLUSIVE_BLOCK_ID, getPublicSocialLinks } from "@/lib/publicProfile";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const headerList = await headers();

  await trackEvent({
    event: "landing_view",
    source: params.source || params.utm_source || "",
    campaign: params.campaign || params.utm_campaign || "",
    userAgent: headerList.get("user-agent") || "",
  });

  return (
    <CreatorProfile
      creator={creator}
      socials={getPublicSocialLinks()}
      exclusiveBlockId={EXCLUSIVE_BLOCK_ID}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
    />
  );
}
