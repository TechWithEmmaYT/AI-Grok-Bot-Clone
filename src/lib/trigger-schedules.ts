import { schedules } from "@trigger.dev/sdk";

/**
 * Keeps a `task` row and its Trigger.dev schedule in step.
 *
 * The row alone fires nothing — the imperative schedule is what runs — so the
 * two are created, updated and destroyed together. Every call here is
 * server-side: it uses the environment secret key, which never reaches the
 * app bundle.
 *
 * Failures are swallowed into a null rather than thrown. A task that saved but
 * failed to schedule is recoverable (the row is visible and can be re-enabled);
 * a save that rolls back because the scheduler hiccuped is not.
 */

const TASK_ID = "scheduled-dot-task";

/** Stable per task, so retries reuse the schedule instead of duplicating it. */
const dedupeKey = (taskId: string) => `task_${taskId}`;

export async function createSchedule(params: {
  taskId: string;
  cron: string;
  timezone: string;
}): Promise<string | null> {
  try {
    const schedule = await schedules.create({
      task: TASK_ID,
      cron: params.cron,
      timezone: params.timezone,
      // The run handler reads this to find the row that owns the firing.
      externalId: params.taskId,
      deduplicationKey: dedupeKey(params.taskId),
    });
    return schedule.id;
  } catch (cause) {
    console.error("[schedules] create failed", { taskId: params.taskId, cause });
    return null;
  }
}

export async function updateSchedule(params: {
  scheduleId: string;
  taskId: string;
  cron: string;
  timezone: string;
}): Promise<boolean> {
  try {
    await schedules.update(params.scheduleId, {
      task: TASK_ID,
      cron: params.cron,
      timezone: params.timezone,
      externalId: params.taskId,
    });
    return true;
  } catch (cause) {
    console.error("[schedules] update failed", { taskId: params.taskId, cause });
    return false;
  }
}

/**
 * Pausing deactivates rather than deletes, so resuming keeps the same schedule
 * id and the task's history stays attached to one schedule.
 */
export async function setScheduleActive(scheduleId: string, active: boolean) {
  try {
    if (active) await schedules.activate(scheduleId);
    else await schedules.deactivate(scheduleId);
    return true;
  } catch (cause) {
    console.error("[schedules] activate/deactivate failed", { scheduleId, active, cause });
    return false;
  }
}

export async function deleteSchedule(scheduleId: string) {
  try {
    await schedules.del(scheduleId);
    return true;
  } catch (cause) {
    console.error("[schedules] delete failed", { scheduleId, cause });
    return false;
  }
}
