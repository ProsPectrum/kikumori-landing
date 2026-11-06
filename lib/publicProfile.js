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
  exclusiveCaption: "Exclusive content here 🩵",
  online: true,
};

export function getCreatorProfile(sourceId = "") {
  if (sourceId === "fb-kikumori") {
    return {
      ...creator,
      heroSrc: "/hero-facebook.png",
      exclusiveSrc: "/exclusive-facebook.png",
    };
  }
  return creator;
}

function envUrl(name, fallback) {
  const value = process.env[name];
  return value && value.startsWith("http") ? value : fallback;
}

export function getPublicSocialLinks(sourceId = "") {
  if (sourceId === "fb-kikumori") return [];

  const instagramHref =
    sourceId === "ig-realkiorae"
      ? envUrl(
          "NEXT_PUBLIC_INSTAGRAM_URL_REALKIORAE",
          "https://www.instagram.com/realkiorae/",
        )
      : envUrl("NEXT_PUBLIC_INSTAGRAM_URL", "https://www.instagram.com/itskiorae/");

  return [
    {
      id: "instagram",
      label: "Instagram",
      href: instagramHref,
    },
    {
      id: "x",
      label: "X",
      href: envUrl("NEXT_PUBLIC_X_URL", "https://x.com/KikuMorii"),
    },
  ];
}
