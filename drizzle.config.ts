import { neonConfig } from "@neondatabase/serverless";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import ws from "ws";

// drizzle-kit reaches Neon over a websocket, which Node does not hand the
// driver by default. Without this, `drizzle-kit migrate` fails silently.
neonConfig.webSocketConstructor = ws;

export default defineConfig({
  schema: [
    "./src/db/auth-schema.ts",
    "./src/db/app-schema.ts",
    "./src/db/task-schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Keep generated SQL reviewable in the repo rather than pushing silently.
  verbose: true,
  strict: true,
});
