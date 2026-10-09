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
];

export const CHART_METRICS = [
  { id: "views", label: "Page views", color: "#fafafa" },
  { id: "exclusive", label: "OnlyFans clicks", color: "#67e8f9" },
  { id: "instagram", label: "Instagram clicks", color: "#E1306C" },
  { id: "x", label: "X clicks", color: "#a3a3a3" },
];
