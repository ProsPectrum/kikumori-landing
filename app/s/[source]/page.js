import { notFound } from "next/navigation";

import { LandingView } from "@/app/landing-view";
import { isKnownSourceId } from "@/lib/trafficSources";

export const dynamic = "force-dynamic";

export default async function SourceLanding({ params }) {
  const { source } = await params;
  if (!isKnownSourceId(source)) notFound();
  return <LandingView sourceId={source} recordView />;
}
