export const EXCLUSIVE_BLOCK_ID = "exclusive";

export const creator = {
  name: "Kiku Rae",
  handle: "@kikumori",
  tagline: "Photos, daily notes, and studio updates.",
  avatarSrc: "/avatar.svg",
  avatarAlt: "Kikumori",
  heroSrc: "/hero.png",
  heroAlt: "Kikumori on a balcony",
  exclusiveSrc: "/exclusive.png",
  exclusiveAlt: "Exclusive content teaser",
  exclusiveCaption: "More of me 🩵",
  online: true,
};

function envUrl(name, fallback) {
  const value = process.env[name];
  return value && value.startsWith("http") ? value : fallback;
}

export function getPublicSocialLinks() {
  return [
    {
      id: "instagram",
      label: "Instagram",
      href: envUrl("NEXT_PUBLIC_INSTAGRAM_URL", "https://www.instagram.com/itskiorae/"),
    },
    {
      id: "x",
      label: "X",
      href: envUrl("NEXT_PUBLIC_X_URL", "https://x.com/KikuMorii"),
    },
    {
      id: "threads",
      label: "Threads",
      href: envUrl("NEXT_PUBLIC_THREADS_URL", "https://www.threads.net/@itskiorae"),
    },
    {
      id: "reddit",
      label: "Reddit",
      href: envUrl("NEXT_PUBLIC_REDDIT_URL", "https://www.reddit.com/user/kikumori"),
    },
  ];
}
