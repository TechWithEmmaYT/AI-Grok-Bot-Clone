import { db } from "@/db";
import { dot, dotTool, type ToolKey } from "@/db/app-schema";
import { task, taskRun } from "@/db/task-schema";
import { invalid, requireUserId, unauthorized } from "@/lib/server-auth";
import { createSchedule } from "@/lib/trigger-schedules";
import { createTaskSchema } from "@/lib/validation";
import { and, desc, eq, inArray } from "drizzle-orm";

/**
 * The Tasks list and task creation.
 *
 * A task is only meaningful next to the Dot that performs it, so the list
 * joins the Dot's name, shape and colour rather than making the client fetch
 * them row by row.
 */

export async function GET(request: Request) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const rows = await db
    .select({
      id: task.id,
      name: task.name,
      prompt: task.prompt,
      cronExpression: task.cronExpression,
      timezone: task.timezone,
      enabled: task.enabled,
      nextRunAt: task.nextRunAt,
      dotId: dot.id,
      dotName: dot.name,
      shape: dot.shape,
      color: dot.color,
    })
    .from(task)
    .innerJoin(dot, eq(task.dotId, dot.id))
    .where(eq(task.userId, userId))
    .orderBy(desc(task.createdAt));

  if (rows.length === 0) return Response.json({ tasks: [] });

  // One query for every task's runs, then grouped in memory — the alternative
  // is a query per row, which is what makes list screens slow.
  const runs = await db
    .select()
    .from(taskRun)
    .where(
      inArray(
        taskRun.taskId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(desc(taskRun.startedAt));

  const byTask = new Map<string, typeof runs>();
  for (const run of runs) {
    byTask.set(run.taskId, [...(byTask.get(run.taskId) ?? []), run]);
  }

  const tools = await db
    .select()
    .from(dotTool)
    .where(
      inArray(
        dotTool.dotId,
        rows.map((row) => row.dotId),
      ),
    );

  const byDot = new Map<string, ToolKey[]>();
  for (const tool of tools) {
    if (!tool.enabled) continue;
    byDot.set(tool.dotId, [...(byDot.get(tool.dotId) ?? []), tool.toolKey as ToolKey]);
  }

  return Response.json({
    tasks: rows.map((row) => {
      const taskRuns = byTask.get(row.id) ?? [];
      const latest = taskRuns[0];

      // "Running" is derived from the live run rather than stored on the task,
      // so it can never disagree with what actually happened.
      const status = latest?.status === "running" ? "running" : row.enabled ? "scheduled" : "paused";

      return { ...row, status, runs: taskRuns, tools: byDot.get(row.dotId) ?? [] };
    }),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const parsed = createTaskSchema.safeParse(await request.json());
  if (!parsed.success) return invalid("Invalid task", parsed.error.issues);

  const { dotId, name, prompt, cronExpression, timezone } = parsed.data;

  // The Dot must belong to the caller, or a task could be pointed at someone
  // else's agent and its instructions.
  const [owned] = await db
    .select({ id: dot.id })
    .from(dot)
    .where(and(eq(dot.id, dotId), eq(dot.userId, userId)))
    .limit(1);

  if (!owned) return Response.json({ error: "Dot not found" }, { status: 404 });

  const id = crypto.randomUUID();
  const triggerScheduleId = await createSchedule({ taskId: id, cron: cronExpression, timezone });

  const [created] = await db
    .insert(task)
    .values({ id, userId, dotId, name, prompt, cronExpression, timezone, triggerScheduleId })
    .returning();

  return Response.json(
    { task: created, scheduled: triggerScheduleId !== null },
    { status: 201 },
  );
}
