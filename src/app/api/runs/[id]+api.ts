import { db } from "@/db";
import { dot } from "@/db/app-schema";
import { task, taskRun } from "@/db/task-schema";
import { notFound, requireUserId, unauthorized } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";

/** One run, for the timeline and summary screen. */
export async function GET(request: Request, { id }: { id: string }) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const [row] = await db
    .select({
      id: taskRun.id,
      status: taskRun.status,
      startedAt: taskRun.startedAt,
      finishedAt: taskRun.finishedAt,
      durationMs: taskRun.durationMs,
      summary: taskRun.summary,
      error: taskRun.error,
      steps: taskRun.steps,
      sources: taskRun.sources,
      taskId: task.id,
      taskName: task.name,
      dotName: dot.name,
      shape: dot.shape,
      color: dot.color,
    })
    .from(taskRun)
    .innerJoin(task, eq(taskRun.taskId, task.id))
    .innerJoin(dot, eq(task.dotId, dot.id))
    // Scoped by the run's own userId, so a run id guessed from elsewhere
    // still cannot be read.
    .where(and(eq(taskRun.id, id), eq(taskRun.userId, userId)))
    .limit(1);

  if (!row) return notFound("Run");

  return Response.json({ run: row });
}
