import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

/**
 * Applies pending Drizzle migrations over Neon's HTTP driver.
 *
 * `drizzle-kit migrate` reaches Neon over a websocket and fails silently here,
 * so this does the same job through the HTTP driver the app already uses. It
 * reads the same journal and writes the same drizzle.__drizzle_migrations rows,
 * so the two stay interchangeable.
 */
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const sql = neon(url);
const dir = path.join(process.cwd(), "drizzle");

const journal = JSON.parse(
  fs.readFileSync(path.join(dir, "meta", "_journal.json"), "utf8"),
);

await sql.query("create schema if not exists drizzle");
await sql.query(`create table if not exists drizzle.__drizzle_migrations (
  id serial primary key,
  hash text not null,
  created_at bigint
)`);

const applied = new Set(
  (await sql.query("select hash from drizzle.__drizzle_migrations")).map((r) => r.hash),
);

let count = 0;
for (const entry of journal.entries) {
  const file = `${entry.tag}.sql`;
  const body = fs.readFileSync(path.join(dir, file), "utf8");
  const hash = crypto.createHash("sha256").update(body).digest("hex");

  if (applied.has(hash)) continue;

  // Drizzle separates statements with this marker; HTTP takes one at a time.
  const statements = body
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`applying ${file} (${statements.length} statements)`);
  for (const statement of statements) await sql.query(statement);

  await sql.query(
    "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
    [hash, entry.when],
  );
  count += 1;
}

console.log(count === 0 ? "Already up to date." : `Applied ${count} migration(s).`);
