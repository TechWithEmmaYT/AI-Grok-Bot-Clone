import * as ExpoCrypto from "expo-crypto";

/**
 * React Native has no global `crypto`, but the Trigger chat SDK calls
 * `crypto.randomUUID()` directly when building message and part ids — so the
 * first send throws "Property 'crypto' doesn't exist" without this.
 *
 * expo-crypto is part of the Expo SDK, so this works in Expo Go and needs no
 * development build. Only the two methods the SDKs actually reach for on the
 * device are defined; `crypto.subtle` is deliberately absent, because the only
 * callers (tool-approval signing in `ai`) run server-side in the Trigger task.
 *
 * Imported for its side effect, so it must run before any SDK code does.
 */
const existing = globalThis.crypto as Partial<Crypto> | undefined;

if (typeof existing?.randomUUID !== "function") {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    enumerable: false,
    writable: true,
    value: {
      ...(existing ?? {}),
      randomUUID: ExpoCrypto.randomUUID,
      getRandomValues: ExpoCrypto.getRandomValues,
    },
  });
}
