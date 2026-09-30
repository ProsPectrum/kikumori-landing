process.env.TOKEN_STORE = process.env.TOKEN_STORE || "memory";
process.env.EXCLUSIVE_DESTINATION_URL =
  process.env.EXCLUSIVE_DESTINATION_URL ||
  "https://exclusive-test.example.invalid/gated-kikumori";
process.env.TURNSTILE_SECRET_KEY =
  process.env.TURNSTILE_SECRET_KEY || "test-secret";
process.env.SITE_URL = process.env.SITE_URL || "http://localhost:3000";

import { register } from "node:module";

register("./server-only-loader.mjs", import.meta.url);
