import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { dot } from "./app-schema";

/**
 * Scheduled work: a `task` is a recurring job a Dot performs on a cron, and a
 * `task_run` is one execution of it.
 *
 * `cronExpression` and `timezone` are the source of truth — the Tasks UI only
 * ever shows a human reading of them. `triggerScheduleId` points at the
 * imperative schedule created through the Trigger.dev API, which is what
 * actually fires; the row on its own schedules nothing, so the two must be
 * created and torn down together.
 *
 * A run's `steps` and `sources` are jsonb because their shape belongs to the
 * run timeline in the UI rather than to a relational model, and nothing
 * queries inside them.
 */

export const RUN_STATUSES = ["running", "completed", "failed", "skipped"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export type RunStepRecord = {
  id: string;
  title: string;
  detail?: string;
  at: string;
  icon: "start" | "search" | "browse" | "write" | "done" | "failed";
};

export type RunSourceRecord = {
  id: string;
  name: string;
  host: string;
};

export const task = pgTable(
  "task",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dotId: text("dot_id")
      .notNull()
      .references(() => dot.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prompt: text("prompt").notNull(),
    cronExpression: text("cron_expression").notNull(),
    timezone: text("timezone").notNull().default("UTC"),
    enabled: boolean("enabled").notNull().default(true),
    triggerScheduleId: text("trigger_schedule_id"),
    nextRunAt: timestamp("next_run_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("task_user_id_idx").on(table.userId),
    index("task_dot_id_idx").on(table.dotId),
  ],
);

export const taskRun = pgTable(
  "task_run",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    triggerRunId: text("trigger_run_id"),
    status: text("status").$type<RunStatus>().notNull().default("running"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
    durationMs: integer("duration_ms"),
    summary: text("summary"),
    error: text("error"),
    steps: jsonb("steps").$type<RunStepRecord[]>().notNull().default([]),
    sources: jsonb("sources").$type<RunSourceRecord[]>().notNull().default([]),
  },
  (table) => [
    index("task_run_task_started_idx").on(table.taskId, table.startedAt),
    index("task_run_user_id_idx").on(table.userId),
  ],
);

export const taskRelations = relations(task, ({ one, many }) => ({
  owner: one(user, { fields: [task.userId], references: [user.id] }),
  dot: one(dot, { fields: [task.dotId], references: [dot.id] }),
  runs: many(taskRun),
}));

export const taskRunRelations = relations(taskRun, ({ one }) => ({
  task: one(task, { fields: [taskRun.taskId], references: [task.id] }),
}));
