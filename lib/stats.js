import "server-only";

import { CLICK_TARGETS, TRAFFIC_SOURCES, isKnownSourceId } from "./trafficSources.js";
import { getStore } from "./store/index.js";

const DAY_TTL = 60 * 60 * 24 * 90;
const ALL_TTL = 60 * 60 * 24 * 400;

export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function viewKeys(sourceId, day) {
  return [`stats:${day}:${sourceId}:views`, `stats:all:${sourceId}:views`];
}

function clickKeys(sourceId, target, day) {
  return [
    `stats:${day}:${sourceId}:click:${target}`,
    `stats:all:${sourceId}:click:${target}`,
  ];
}

export async function recordPageView(sourceId) {
  if (!isKnownSourceId(sourceId)) return;
  const day = utcDay();
  const store = getStore();
  const [daily, total] = viewKeys(sourceId, day);
  await store.incrCounter(daily, DAY_TTL);
  await store.incrCounter(total, ALL_TTL);
}

export async function recordClick(sourceId, target) {
  if (!isKnownSourceId(sourceId)) return;
  if (!CLICK_TARGETS.some((row) => row.id === target)) return;
  const day = utcDay();
  const store = getStore();
  const [daily, total] = clickKeys(sourceId, target, day);
  await store.incrCounter(daily, DAY_TTL);
  await store.incrCounter(total, ALL_TTL);
}

function recentDays(count) {
  const days = [];
  const now = Date.now();
  for (let i = 0; i < count; i += 1) {
    days.push(utcDay(new Date(now - i * 86400000)));
  }
  return days;
}

export async function getDashboardStats({ days = 7 } = {}) {
  const store = getStore();
  const windowDays = recentDays(days);
  const today = utcDay();
  const keys = [];

  for (const source of TRAFFIC_SOURCES) {
    keys.push(`stats:all:${source.id}:views`);
    keys.push(`stats:${today}:${source.id}:views`);
    for (const day of windowDays) {
      keys.push(`stats:${day}:${source.id}:views`);
    }
    for (const target of CLICK_TARGETS) {
      keys.push(`stats:all:${source.id}:click:${target.id}`);
      keys.push(`stats:${today}:${source.id}:click:${target.id}`);
      for (const day of windowDays) {
        keys.push(`stats:${day}:${source.id}:click:${target.id}`);
      }
    }
  }

  const values = await store.mgetCounters(keys);
  const map = new Map(keys.map((key, index) => [key, Number(values[index] || 0)]));

  function sum(list) {
    return list.reduce((acc, key) => acc + (map.get(key) || 0), 0);
  }

  return {
    today,
    days,
    sources: TRAFFIC_SOURCES.map((source) => ({
      id: source.id,
      networkLabel: source.networkLabel,
      handle: source.handle,
      path: `/s/${source.id}`,
      all: {
        views: map.get(`stats:all:${source.id}:views`) || 0,
        clicks: Object.fromEntries(
          CLICK_TARGETS.map((target) => [
            target.id,
            map.get(`stats:all:${source.id}:click:${target.id}`) || 0,
          ]),
        ),
      },
      today: {
        views: map.get(`stats:${today}:${source.id}:views`) || 0,
        clicks: Object.fromEntries(
          CLICK_TARGETS.map((target) => [
            target.id,
            map.get(`stats:${today}:${source.id}:click:${target.id}`) || 0,
          ]),
        ),
      },
      window: {
        views: sum(windowDays.map((day) => `stats:${day}:${source.id}:views`)),
        clicks: Object.fromEntries(
          CLICK_TARGETS.map((target) => [
            target.id,
            sum(
              windowDays.map(
                (day) => `stats:${day}:${source.id}:click:${target.id}`,
              ),
            ),
          ]),
        ),
      },
    })),
  };
}
