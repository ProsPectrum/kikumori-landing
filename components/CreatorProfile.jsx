import Link from "next/link";

import ExclusiveButton from "./ExclusiveButton";
import SocialLinks from "./SocialLinks";

function VerifiedBadge() {
  return (
    <span className="text-sky-400" aria-label="Verified">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 2l2.4 1.8 3 .2.9 2.9L20.5 9l-1.2 2.8 1.2 2.8-2.2 2-.9 2.9-3 .2L12 22l-2.4-1.8-3-.2-.9-2.9L3.5 15l1.2-2.8L3.5 9l2.2-2 .9-2.9 3-.2L12 2zm-1 12.5l5-5-1.4-1.4L11 11.7 9.4 10 8 11.4l3 3.1z" />
      </svg>
    </span>
  );
}

export default function CreatorProfile({
  creator,
  socials,
  exclusiveBlockId,
  turnstileSiteKey,
}) {
  return (
    <main className="relative min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-16 pt-6">
        <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-[28px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={creator.heroSrc}
            alt={creator.heroAlt}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-center gap-1.5 leading-none">
            <h1 className="py-1 text-[26px] font-extrabold tracking-tight">
              {creator.name}
            </h1>
            <VerifiedBadge />
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-white/55">
            <span>{creator.handle}</span>
            {creator.online ? (
              <>
                <span className="text-white/20">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-6">
          <ExclusiveButton
            blockId={exclusiveBlockId}
            siteKey={turnstileSiteKey}
            imageSrc={creator.exclusiveSrc}
            imageAlt={creator.exclusiveAlt}
            caption={creator.exclusiveCaption}
          />
        </div>

        <SocialLinks links={socials} />

        <footer className="mt-10 flex justify-center gap-3 text-[11px] text-neutral-600">
          <Link href="/privacy" className="hover:text-neutral-400">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-neutral-400">
            Terms
          </Link>
          <span>·</span>
          <Link href="/report" className="hover:text-neutral-400">
            Report
          </Link>
        </footer>
      </div>
    </main>
  );
}
