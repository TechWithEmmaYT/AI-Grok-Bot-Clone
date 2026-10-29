import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

/**
 * Client half of Better Auth. The base URL is public by design — it is just
 * the origin the API routes are served from. Secrets stay on the server.
 *
 * On a physical device localhost means the phone itself, so EXPO_PUBLIC_API_URL
 * must be the machine's LAN address (or a deployed HTTPS origin) rather than
 * localhost when testing off-simulator.
 */
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      // Must match `expo.scheme` in app.json.
      scheme: "dot",
      storagePrefix: "dot",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
