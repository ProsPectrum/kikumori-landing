import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { getPublicSocialLinks } from "../lib/publicProfile.js";
import { TRAFFIC_SOURCES, isKnownSourceId } from "../lib/trafficSources.js";
import { recordClick, recordPageView, getDashboardStats } from "../lib/stats.js";
import { formatConversion, ofConversionRate } from "../lib/statsMath.js";
import { resetMemoryStore } from "../lib/store/memory.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Instagram button uses realkiorae only for that tracking source", () => {
  const defaultIg = getPublicSocialLinks("ig-itskiorae").find((row) => row.id === "instagram");
  const redditIg = getPublicSocialLinks("reddit-kikumori").find((row) => row.id === "instagram");
  const realIg = getPublicSocialLinks("ig-realkiorae").find((row) => row.id === "instagram");
  assert.equal(defaultIg.href, "https://www.instagram.com/itskiorae/");
  assert.equal(redditIg.href, "https://www.instagram.com/itskiorae/");
  assert.equal(realIg.href, "https://www.instagram.com/realkiorae/");
  assert.equal(getPublicSocialLinks("").find((row) => row.id === "instagram").href, "https://www.instagram.com/itskiorae/");
});

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
  assert.equal(row.series.at(-1).views, 2);
  assert.equal(row.series.at(-1).clicks.exclusive, 1);
  assert.equal(row.series[0].views, 0);
});

test("OnlyFans conversion is exclusive clicks divided by views", () => {
  assert.equal(ofConversionRate(0, 1), null);
  assert.equal(ofConversionRate(4, 1), 0.25);
  assert.equal(formatConversion(0.25), "25.0%");
  assert.equal(formatConversion(null), "—");
});
