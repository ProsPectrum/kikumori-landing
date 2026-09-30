export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      url: new URL("./empty-server-only.mjs", import.meta.url).href,
    };
  }
  return nextResolve(specifier, context);
}
