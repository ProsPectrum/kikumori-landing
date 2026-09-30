import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const needle =
  process.env.EXCLUSIVE_DESTINATION_URL ||
  "https://exclusive-test.example.invalid/gated-kikumori";

const SKIP = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

test("source, components, and public files do not contain the destination URL", () => {
  const files = walk(root).filter((file) => {
    const relative = path.relative(root, file).replaceAll("\\", "/");
    if (relative === ".env.example" || relative.startsWith(".env")) return false;
    if (relative.startsWith("tests/")) return false;
    if (relative.endsWith(".md")) return false;
    return true;
  });

  const leaks = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (text.includes(needle)) leaks.push(path.relative(root, file));
  }

  assert.deepEqual(leaks, []);
});
