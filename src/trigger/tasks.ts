import { gateway } from "@ai-sdk/gateway";
import { logger, schedules, tasks, task as defineTask } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { dot } from "@/db/app-schema";
import { task, taskRun, type RunSourceRecord, type RunStepRecord } from "@/db/task-schema";

/**
 * Scheduled work, as three tasks:
 *
 *   scheduledDotTask -> fires on the cron, resolves the row, hands off
 *   runDotTask       -> the agentic run; owns the task_run lifecycle
 *   summarizeRun     -> a cheap pass that turns the output into a card
 *
 * The split matters: a schedule firing and a run executing have different
 * failure modes, and keeping the cron handler thin means a bad run never
 * stops the next one being scheduled.
 */

const MODEL = process.env.AI_GATEWAY_MODEL ?? "anthropic/claude-sonnet-5.5";
const SUMMARY_MODEL = process.env.AI_SUMMARY_MODEL ?? "anthropic/claude-haiku-4.5";

const now = () => new Date().toISOString();

const step = (
  id: string,
  title: string,
  icon: RunStepRecord["icon"],
  detail?: string,
): RunStepRecord => ({ id, title, detail, at: now(), icon });

/**
 * Fires on each task's cron. The schedule carries the task id as its
 * `externalId`, which is the only link back to our row.
 */
export const scheduledDotTask = schedules.task({
  id: "scheduled-dot-task",
  run: async (payload) => {
    const taskId = payload.externalId;
    if (!taskId) {
      logger.warn("Schedule fired with no externalId; nothing to run");
      return { skipped: "no-external-id" };
    }

    const [row] = await db.select().from(task).where(eq(task.id, taskId)).limit(1);

    if (!row) {
      // The row is gone but the schedule survived it. Deleting here stops it
      // firing forever against nothing.
      logger.warn("Task row missing; removing its schedule", { taskId });
      if (payload.scheduleId) await schedules.del(payload.scheduleId);
      return { skipped: "task-deleted" };
    }

    if (!row.enabled) {
      logger.info("Task is paused; skipping this firing", { taskId });
      return { skipped: "disabled" };
    }

    const handle = await tasks.trigger<typeof runDotTask>("run-dot-task", {
      taskId: row.id,
      userId: row.userId,
    });

    return { runId: handle.id };
  },
});

/**
 * One execution of a task. Writes the `task_run` row first so a run that dies
 * mid-flight is still visible as "running" rather than vanishing, then
 * finalises it in every exit path.
 */
export const runDotTask = defineTask({
  id: "run-dot-task",
  run: async ({ taskId, userId }: { taskId: string; userId: string }) => {
    const [row] = await db
      .select()
      .from(task)
      .where(and(eq(task.id, taskId), eq(task.userId, userId)))
      .limit(1);

    if (!row) throw new Error(`Task ${taskId} not found for this user`);

    const [owner] = await db.select().from(dot).where(eq(dot.id, row.dotId)).limit(1);

    const runId = crypto.randomUUID();
    const startedAt = new Date();
    const steps: RunStepRecord[] = [step("s1", "Started", "start")];

    await db.insert(taskRun).values({
      id: runId,
      taskId: row.id,
      userId,
      status: "running",
      startedAt,
      steps,
    });

    const finish = async (
      status: "completed" | "failed",
      extra: { summary?: string; error?: string; sources?: RunSourceRecord[] },
    ) => {
      const finishedAt = new Date();
      await db
        .update(taskRun)
        .set({
          status,
          finishedAt,
          durationMs: finishedAt.getTime() - startedAt.getTime(),
          steps,
          sources: extra.sources ?? [],
          summary: extra.summary ?? null,
          error: extra.error ?? null,
        })
        .where(eq(taskRun.id, runId));
    };

    try {
      steps.push(step("s2", "Working", "search", row.name));

      const result = await generateText({
        model: gateway(MODEL),
        system: [
          `You are ${owner?.name ?? "Dot"}, running a scheduled task for its owner.`,
          owner?.instructions,
          "Answer in Markdown. Be concise and concrete — this is read on a phone.",
        ]
          .filter(Boolean)
          .join("\n\n"),
        prompt: row.prompt,
      });

      steps.push(step("s3", "Generating summary", "write", "Creating final report"));

      const summary = await tasks.triggerAndWait<typeof summarizeRun>("summarize-run", {
        text: result.text,
      });

      steps.push(step("s4", "Completed", "done", "Report ready"));

      await finish("completed", {
        summary: summary.ok ? summary.output.summary : result.text,
      });

      return { runId, status: "completed" as const };
    } catch (cause) {
      // The step list is the user-facing explanation, so the failure is
      // recorded there as well as in the row's error column.
      steps.push(step("s3", "Failed", "failed", "The run stopped early"));
      await finish("failed", {
        error: cause instanceof Error ? cause.message : "The run failed unexpectedly.",
      });
      throw cause;
    }
  },
});

/** Cheap pass that turns a long answer into the card shown on the run. */
export const summarizeRun = defineTask({
  id: "summarize-run",
  run: async ({ text }: { text: string }) => {
    const { text: summary } = await generateText({
      model: gateway(SUMMARY_MODEL),
      system:
        "Summarise the result of a scheduled agent run for a phone screen. " +
        "Open with a short title line, then at most five bullets. Markdown only.",
      prompt: text,
    });

    return { summary };
  },
});
