import { auth } from "@/lib/auth";

// Catch-all for every Better Auth endpoint: /api/auth/sign-up/email,
// /api/auth/sign-in/email, /api/auth/get-session, OAuth callbacks, and so on.
// Runs server-side only, so the secret and DATABASE_URL never reach the client.
const handler = auth.handler;

export { handler as GET, handler as POST };
