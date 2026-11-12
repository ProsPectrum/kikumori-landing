import { cookies } from "next/headers";

import { LandingView } from "@/app/landing-view";
import { SOURCE_COOKIE, isKnownSourceId } from "@/lib/trafficSources";

export const dynamic = "force-dynamic";

export default async function Home() {
  const jar = await cookies();
  const sourceId = isKnownSourceId(jar.get(SOURCE_COOKIE)?.value)
    ? jar.get(SOURCE_COOKIE).value
    : "";

  return <LandingView sourceId={sourceId} recordView={false} />;
}
