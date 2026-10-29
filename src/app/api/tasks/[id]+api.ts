import { db } from "@/db";
import { dot, dotTool, type ToolKey } from "@/db/app-schema";
import { task, taskRun } from "@/db/task-schema";
import { invalid, notFound, requireUserId, unauthorized } from "@/lib/server-auth";
import { deleteSchedule, setScheduleActive, updateSchedule } from "@/lib/trigger-schedules";
import { updateTaskSchema } from "@/lib/validation";
import { and, desc, eq } from "drizzle-orm";

/** One task: its detail screen, its editor, and deleting it. */

async function load(userId: string, id: string) {
  const [row] = await db
    .select({
      id: task.id,
      name: task.name,
      prompt: task.prompt,
      cronExpression: task.cronExpression,
      timezone: task.timezone,
      enabled: task.enabled,
      nextRunAt: task.nextRunAt,
      triggerScheduleId: task.triggerScheduleId,
      dotId: dot.id,
      dotName: dot.name,
      shape: dot.shape,
      color: dot.color,
    })
    .from(task)
    .innerJoin(dot, eq(task.dotId, dot.id))
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .limit(1);

  return row ?? null;
}

export async function GET(request: Request, { id }: { id: string }) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const row = await load(userId, id);
  if (!row) return notFound("Task");

  const runs = await db
    .select()
    .from(taskRun)
    .where(eq(taskRun.taskId, id))
    .orderBy(desc(taskRun.startedAt))
    .limit(20);

  const tools = await db
    .select()
    .from(dotTool)
    .where(and(eq(dotTool.dotId, row.dotId), eq(dotTool.enabled, true)));

  const status = runs[0]?.status === "running" ? "running" : row.enabled ? "scheduled" : "paused";

  return Response.json({
    task: { ...row, status, runs, tools: tools.map((t) => t.toolKey as ToolKey) },
  });
}

export async function PATCH(request: Request, { id }: { id: string }) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const existing = await load(userId, id);
  if (!existing) return notFound("Task");

  const parsed = updateTaskSchema.safeParse(await request.json());
  if (!parsed.success) return invalid("Invalid task", parsed.error.issues);

  const patch = parsed.data;
  const cron = patch.cronExpression ?? existing.cronExpression;
  const timezone = patch.timezone ?? existing.timezone;

  // Keep the schedule in step with the row. Enabling and disabling only
  // toggles the existing schedule, so resuming does not mint a new one.
  if (existing.triggerScheduleId) {
    if (patch.cronExpression || patch.timezone) {
      await updateSchedule({
        scheduleId: existing.triggerScheduleId,
        taskId: id,
        cron,
        timezone,
      });
    }
    if (patch.enabled !== undefined && patch.enabled !== existing.enabled) {
      await setScheduleActive(existing.triggerScheduleId, patch.enabled);
    }
  }

  const [updated] = await db
    .update(task)
    .set({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.prompt !== undefined && { prompt: patch.prompt }),
      ...(patch.cronExpression !== undefined && { cronExpression: patch.cronExpression }),
      ...(patch.timezone !== undefined && { timezone: patch.timezone }),
      ...(patch.enabled !== undefined && { enabled: patch.enabled }),
    })
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .returning();

  return Response.json({ task: updated });
}

export async function DELETE(request: Request, { id }: { id: string }) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const existing = await load(userId, id);
  if (!existing) return notFound("Task");

  // The schedule goes first: a row deleted while its schedule survives would
  // fire forever against nothing.
  if (existing.triggerScheduleId) await deleteSchedule(existing.triggerScheduleId);

  await db.delete(task).where(and(eq(task.id, id), eq(task.userId, userId)));

  return Response.json({ deleted: true });
}
