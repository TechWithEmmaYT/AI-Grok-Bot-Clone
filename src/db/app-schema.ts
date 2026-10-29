import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Agent ("Dot") tables, derived from the creation flow in _designs/:
 *   1. template picker        -> template
 *   2. shape / colour / name  -> dot
 *   3. instructions + tools   -> dot.instructions, dot_tool
 *
 * Shapes and colours are stored as text rather than Postgres enums: the set
 * lives in src/components/dots/dotLooks.ts, and adding one there should not
 * require a database migration.
 */

export const DOT_STATUSES = ["active", "archived"] as const;
export type DotStatus = (typeof DOT_STATUSES)[number];

export const TOOL_KEYS = [
  "treg_research",
  "web_browser",
  "gmail",
  "calendar",
  "github",
  "sheets",
  "e2b_desktop",
] as const;
export type ToolKey = (typeof TOOL_KEYS)[number];

/** Seeded starting points — "Popular templates" in dot-creation-flow-1. */
export const template = pgTable("template", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  defaultInstructions: text("default_instructions").notNull(),
  defaultShape: text("default_shape").notNull(),
  defaultColor: text("default_color").notNull(),
  defaultTools: jsonb("default_tools").$type<ToolKey[]>().notNull().default([]),
  sortOrder: text("sort_order").notNull().default("0"),
});

export const dot = pgTable(
  "dot",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    shape: text("shape").notNull().default("blob"),
    color: text("color").notNull().default("blue"),
    instructions: text("instructions").notNull().default(""),
    /** Null when built from scratch. */
    templateKey: text("template_key"),
    status: text("status").$type<DotStatus>().notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("dot_user_id_idx").on(table.userId),
    // Home filters by status within a user, so the pair is the useful index.
    index("dot_user_status_idx").on(table.userId, table.status),
  ],
);

/**
 * One row per tool a Dot may use. Rows exist only for tools the user has
 * touched; absence means "off", which keeps adding a new tool key from
 * backfilling every existing Dot.
 */
export const dotTool = pgTable(
  "dot_tool",
  {
    dotId: text("dot_id")
      .notNull()
      .references(() => dot.id, { onDelete: "cascade" }),
    toolKey: text("tool_key").$type<ToolKey>().notNull(),
    enabled: boolean("enabled").notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.dotId, table.toolKey] })],
);

export const dotRelations = relations(dot, ({ one, many }) => ({
  owner: one(user, { fields: [dot.userId], references: [user.id] }),
  tools: many(dotTool),
}));

export const dotToolRelations = relations(dotTool, ({ one }) => ({
  dot: one(dot, { fields: [dotTool.dotId], references: [dot.id] }),
}));
