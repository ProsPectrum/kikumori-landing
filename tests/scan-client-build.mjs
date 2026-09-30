import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const destination =
  process.env.EXCLUSIVE_DESTINATION_URL ||
  "https://exclusive-test.example.invalid/gated-kikumori";

const staticDir = path.join(root, ".next", "static");
if (!existsSync(staticDir)) {
  console.error("No .next/static found. Run `next build` before the client leak scan.");
  process.exit(1);
}

const clientRoots = [staticDir];

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function scanDir(dir) {
  const hits = [];
  for (const file of walk(dir)) {
    let text = "";
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (text.includes(destination)) {
      hits.push(path.relative(root, file));
    }
  }
  return hits;
}

const htmlHits = [];
try {
  const serverApp = path.join(root, ".next", "server", "app");
  for (const file of walk(serverApp)) {
    if (!file.endsWith(".html") && !file.endsWith(".rsc")) continue;
    const text = readFileSync(file, "utf8");
    if (text.includes(destination)) htmlHits.push(path.relative(root, file));
  }
} catch {
  // build output may not exist yet
}

const clientHits = clientRoots.flatMap(scanDir);
const allHits = [...clientHits, ...htmlHits];

if (allHits.length > 0) {
  console.error("Destination URL leaked into client-side build artifacts:");
  for (const hit of allHits) console.error(` - ${hit}`);
  process.exit(1);
}

console.log("Client-side build scan passed: destination URL not found.");
