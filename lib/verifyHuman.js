import "server-only";

import { isAllowedBlockId, getDestinationUrl } from "./destination.js";
import { issueRedirectToken } from "./redirectTokens.js";
import { verifyTurnstileToken } from "./turnstile.js";

export async function processHumanVerification({ token, blockId, ip, sourceId = "" }) {
  if (!isAllowedBlockId(blockId)) {
    return { status: 400, body: { error: "invalid_block" } };
  }

  const result = await verifyTurnstileToken(token, ip);
  if (!result.success) {
    return { status: 403, body: { error: "turnstile_failed" } };
  }

  let configured = false;
  try {
    configured = Boolean(getDestinationUrl(blockId, sourceId));
  } catch {
    configured = false;
  }
  if (!configured) {
    return { status: 503, body: { error: "unavailable" } };
  }

  const issued = await issueRedirectToken(blockId, { sourceId });
  // Client receives only an opaque path. Destination stays on the server.
  return {
    status: 200,
    body: {
      redirectPath: `/r/${issued.token}`,
    },
  };
}
