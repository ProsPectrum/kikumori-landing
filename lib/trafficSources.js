export const TRAFFIC_SOURCES = [
  {
    id: "ig-itskiorae",
    network: "instagram",
    networkLabel: "Instagram",
    handle: "itskiorae",
    destEnv: "EXCLUSIVE_DESTINATION_URL_IG_ITSKIORAE",
  },
  {
    id: "ig-realkiorae",
    network: "instagram",
    networkLabel: "Instagram",
    handle: "realkiorae",
    destEnv: "EXCLUSIVE_DESTINATION_URL_IG_REALKIORAE",
  },
  {
    id: "x-kikumorii",
    network: "x",
    networkLabel: "X",
    handle: "KikuMorii",
    destEnv: "EXCLUSIVE_DESTINATION_URL_X_KIKUMORII",
  },
  {
    id: "x-realkiorae",
    network: "x",
    networkLabel: "X",
    handle: "RealKioRae",
    destEnv: "EXCLUSIVE_DESTINATION_URL_X_REALKIORAE",
  },
  {
    id: "reddit-kikumori",
    network: "reddit",
    networkLabel: "Reddit",
    handle: "kikumori",
    destEnv: "EXCLUSIVE_DESTINATION_URL_REDDIT_KIKUMORI",
  },
];

export const SOURCE_COOKIE = "kiku_src";

const SOURCE_IDS = new Set(TRAFFIC_SOURCES.map((row) => row.id));

export function isKnownSourceId(value) {
  return typeof value === "string" && SOURCE_IDS.has(value);
}

export function getTrafficSource(id) {
  return TRAFFIC_SOURCES.find((row) => row.id === id) || null;
}

export const CLICK_TARGETS = [
  { id: "exclusive", label: "OF clicks" },
  { id: "instagram", label: "Instagram clicks" },
  { id: "x", label: "X clicks" },
  { id: "threads", label: "Threads clicks" },
  { id: "reddit", label: "Reddit clicks" },
];
