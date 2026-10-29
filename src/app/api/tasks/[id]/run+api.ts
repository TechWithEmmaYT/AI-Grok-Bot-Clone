import { db } from "@/db";
import { task } from "@/db/task-schema";
import { notFound, requireUserId, unauthorized } from "@/lib/server-auth";
import type { runDotTask } from "@/trigger/tasks";
import { tasks } from "@trigger.dev/sdk";
import { and, eq } from "drizzle-orm";

/**
 * "Run now" — fires the task off-schedule.
 *
 * The task module is imported for its type only, so none of the run code is
 * bundled into the app; the run is addressed by its id.
 */
export async function POST(request: Request, { id }: { id: string }) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const [row] = await db
    .select({ id: task.id })
    .from(task)
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .limit(1);

  if (!row) return notFound("Task");

  // A paused task can still be run by hand — pausing stops the cron, it does
  // not take the button away.
  const handle = await tasks.trigger<typeof runDotTask>("run-dot-task", {
    taskId: row.id,
    userId,
  });

  return Response.json({ triggerRunId: handle.id }, { status: 202 });
}
