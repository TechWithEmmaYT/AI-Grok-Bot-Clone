import { db, schema } from "@/db";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

/**
 * Server-only Better Auth instance.
 *
 * Imported exclusively by src/app/api/auth/[...auth]+api.ts. Everything it
 * reads — the database URL, the signing secret, provider secrets — is
 * unprefixed and therefore absent from the client bundle.
 */
export const auth = betterAuth({
  appName: "Dot",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Turn on once an email provider is wired; until then a verification
    // email that never arrives would lock every new account out.
    requireEmailVerification: false,
  },

  // Social providers land in phase 2b, once Google Cloud and Apple Developer
  // credentials exist. Declaring them with undefined secrets would fail at boot.

  trustedOrigins: [
    "dot://",
    "dot://*",
    "https://appleid.apple.com",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],

  plugins: [expo()],
});
