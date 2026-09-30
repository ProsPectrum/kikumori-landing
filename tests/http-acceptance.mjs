const destination =
  process.env.EXCLUSIVE_DESTINATION_URL ||
  "https://exclusive-test.example.invalid/gated-kikumori";
const base = (process.env.ACCEPTANCE_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function get(pathname) {
  return fetch(`${base}${pathname}`, { redirect: "manual" });
}

async function post(pathname, body, origin = base) {
  const headers = {
    "content-type": "application/json",
  };
  if (origin) headers.origin = origin;
  return fetch(`${base}${pathname}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    redirect: "manual",
  });
}

const home = await get("/");
if (!home.ok) fail(`GET / failed: ${home.status}`);
const homeHtml = await home.text();
if (homeHtml.includes(destination)) fail("GET / leaked destination URL");

const exclusive = await get("/r/exclusive");
if (![403, 404].includes(exclusive.status)) {
  fail(`GET /r/exclusive expected 403/404, got ${exclusive.status}`);
}
if (exclusive.headers.get("location")) {
  fail("GET /r/exclusive must not redirect");
}

const missingApi = await get("/api/destination");
if (missingApi.status !== 404) fail("GET /api/destination must 404");
const missingApiBody = await missingApi.text();
if (missingApiBody.includes(destination)) fail("GET /api/destination leaked destination");

const missingBlock = await get("/api/block/exclusive");
if (missingBlock.status !== 404) fail("GET /api/block/exclusive must 404");

const csrf = await post("/api/verify-human", { token: "x", blockId: "exclusive" }, "");
if (csrf.status !== 403) fail(`verify-human without Origin expected 403, got ${csrf.status}`);

const noToken = await post("/api/verify-human", { blockId: "exclusive" });
if (![400, 403].includes(noToken.status)) {
  fail(`verify-human without token expected reject, got ${noToken.status}`);
}
const noTokenBody = await noToken.text();
if (noTokenBody.includes(destination)) fail("verify-human leaked destination");

const fakeToken = await post("/api/verify-human", {
  blockId: "exclusive",
  token: "fake-token",
});
const fakeBody = await fakeToken.text();
if (fakeBody.includes(destination)) fail("verify-human leaked destination");

let issuedPath = "";
if ([400, 403].includes(fakeToken.status)) {
  console.log("Fake Turnstile token rejected (production-like secret).");
} else if (fakeToken.status === 200) {
  // Cloudflare dummy secret 1x0000…AA accepts any token. JSON still must be opaque.
  let data;
  try {
    data = JSON.parse(fakeBody);
  } catch {
    fail("verify-human 200 was not JSON");
  }
  if (!/^\/r\/[A-Za-z0-9_-]+$/.test(data.redirectPath || "")) {
    fail("valid verification must return an opaque /r/ path");
  }
  issuedPath = data.redirectPath;
  console.log("Dummy Turnstile secret accepted the token; testing one-time redeem.");
} else {
  fail(`verify-human fake token unexpected status ${fakeToken.status}`);
}

if (issuedPath) {
  const first = await get(issuedPath);
  if (first.status !== 302) fail(`one-time token expected 302, got ${first.status}`);
  if (first.headers.get("location") !== destination) {
    fail("302 Location must be the server-side destination");
  }
  const replay = await get(issuedPath);
  if (![403, 410].includes(replay.status)) {
    fail(`replay expected 403/410, got ${replay.status}`);
  }
  if (replay.headers.get("location")) fail("replay must not redirect");
}

const invalid = await get("/r/not-a-real-token");
if (![403, 404].includes(invalid.status)) {
  fail(`invalid token expected 403/404, got ${invalid.status}`);
}

const scripts = [...homeHtml.matchAll(/\/_next\/static\/[^"']+\.js/g)].map(
  (match) => match[0],
);
for (const script of scripts.slice(0, 20)) {
  const response = await get(script);
  if (!response.ok) continue;
  const js = await response.text();
  if (js.includes(destination)) fail(`JS bundle leaked destination: ${script}`);
}

console.log("HTTP acceptance checks passed.");
