import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { TRAFFIC_SOURCES, isKnownSourceId } from "../lib/trafficSources.js";
import { recordClick, recordPageView, getDashboardStats } from "../lib/stats.js";
import { resetMemoryStore } from "../lib/store/memory.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("traffic source ids are unique and do not embed destination URLs", () => {
  const ids = TRAFFIC_SOURCES.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(isKnownSourceId("ig-itskiorae"), true);
  assert.equal(isKnownSourceId("instagram"), false);

  const sourceFile = readFileSync(path.join(root, "lib/trafficSources.js"), "utf8");
  assert.equal(sourceFile.includes("onlyfans.com"), false);
});

test("daily counters attribute views and clicks per source", async () => {
  resetMemoryStore();
  await recordPageView("ig-itskiorae");
  await recordPageView("ig-itskiorae");
  await recordClick("ig-itskiorae", "exclusive");
  await recordClick("ig-itskiorae", "x");
  const data = await getDashboardStats({ days: 7 });
  const row = data.sources.find((item) => item.id === "ig-itskiorae");
  assert.equal(row.all.views, 2);
  assert.equal(row.all.clicks.exclusive, 1);
  assert.equal(row.all.clicks.x, 1);
  const other = data.sources.find((item) => item.id === "x-kikumorii");
  assert.equal(other.all.views, 0);
});
