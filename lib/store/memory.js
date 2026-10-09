const tokens = new Map();
const counters = new Map();
const analytics = [];
let chain = Promise.resolve();

function withLock(fn) {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function resetMemoryStore() {
  tokens.clear();
  counters.clear();
  analytics.length = 0;
  chain = Promise.resolve();
}

export function createMemoryStore() {
  return {
    async setJson(key, value, ttlSeconds) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      tokens.set(key, { value, expiresAt });
    },
    async consumeToken(key, now) {
      return withLock(() => {
        const row = tokens.get(key);
        if (!row) return { status: "missing" };
        if (now > row.expiresAt || now > Number(row.value.expiresAt)) {
          tokens.delete(key);
          return { status: "expired" };
        }
        if (row.value.used) return { status: "used" };
        row.value.used = true;
        tokens.set(key, row);
        return {
          status: "ok",
          blockId: row.value.blockId,
          sourceId: row.value.sourceId || "",
        };
      });
    },
    async increment(key, windowSeconds) {
      const now = Date.now();
      const current = counters.get(key);
      if (!current || now > current.resetAt) {
        counters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
        return 1;
      }
      current.count += 1;
      counters.set(key, current);
      return current.count;
    },
    async incrCounter(key, ttlSeconds) {
      const now = Date.now();
      const current = counters.get(key);
      if (!current || (current.expiresAt && now > current.expiresAt)) {
        counters.set(key, {
          count: 1,
          resetAt: Number.MAX_SAFE_INTEGER,
          expiresAt: ttlSeconds ? now + ttlSeconds * 1000 : null,
        });
        return 1;
      }
      current.count += 1;
      counters.set(key, current);
      return current.count;
    },
    async mgetCounters(keys) {
      const now = Date.now();
      return keys.map((key) => {
        const current = counters.get(key);
        if (!current) return 0;
        if (current.expiresAt && now > current.expiresAt) return 0;
        return current.count || 0;
      });
    },
    async appendAnalytics(key, event, maxEvents) {
      analytics.unshift(event);
      if (analytics.length > maxEvents) analytics.length = maxEvents;
    },
    snapshotAnalytics() {
      return analytics.slice();
    },
  };
}

export const memoryStore = createMemoryStore();
