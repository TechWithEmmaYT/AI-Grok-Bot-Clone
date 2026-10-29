import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Server-only. This module must never be imported from a screen — it reads
 * DATABASE_URL, which has no EXPO_PUBLIC_ prefix and therefore does not exist
 * in the client bundle.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and paste your Neon pooled connection string.",
  );
}

export const db = drizzle(neon(connectionString), { schema });
export { schema };
