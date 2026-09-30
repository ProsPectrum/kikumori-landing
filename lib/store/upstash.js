import "server-only";

const CONSUME_LUA = `
local raw = redis.call('GET', KEYS[1])
if not raw then
  return {'missing'}
end
local data = cjson.decode(raw)
if data.used then
  return {'used'}
end
local now = tonumber(ARGV[1])
if now > tonumber(data.expiresAt) then
  redis.call('DEL', KEYS[1])
  return {'expired'}
end
data.used = true
redis.call('SET', KEYS[1], cjson.encode(data), 'KEEPTTL')
return {'ok', data.blockId}
`;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function upstash(command) {
  const response = await fetch(requiredEnv("UPSTASH_REDIS_REST_URL"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("UPSTASH_REDIS_REST_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Upstash request failed");
  }
  return payload.result;
}

export function createUpstashStore() {
  return {
    async setJson(key, value, ttlSeconds) {
      await upstash(["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]);
    },
    async consumeToken(key, now) {
      const result = await upstash(["EVAL", CONSUME_LUA, "1", key, String(now)]);
      if (!Array.isArray(result) || result.length === 0) return { status: "missing" };
      const status = result[0];
      if (status === "ok") return { status: "ok", blockId: result[1] };
      if (status === "used" || status === "expired" || status === "missing") {
        return { status };
      }
      return { status: "missing" };
    },
    async increment(key, windowSeconds) {
      const count = Number(await upstash(["INCR", key]));
      if (count === 1) {
        await upstash(["EXPIRE", key, String(windowSeconds)]);
      }
      return count;
    },
    async appendAnalytics(key, event, maxEvents) {
      await upstash(["LPUSH", key, JSON.stringify(event)]);
      await upstash(["LTRIM", key, "0", String(maxEvents - 1)]);
      await upstash(["EXPIRE", key, String(60 * 60 * 24 * 14)]);
    },
  };
}

export function hasUpstashConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}
