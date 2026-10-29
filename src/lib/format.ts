/**
 * Date and duration formatting for the task and run screens.
 *
 * The API returns ISO strings; every screen shows a phrase. Doing this in one
 * place keeps "Today, 8:00 AM" meaning the same thing in the list, the detail
 * and the run timeline.
 */

const time = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/** "8:00:12 AM" — seconds matter on a run timeline, not anywhere else. */
export function clockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Today, 8:00 AM" · "Yesterday, 8:00 AM" · "Oct 4, 8:00 AM". */
export function dayAndTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

  if (days === 0) return `Today, ${time(date)}`;
  if (days === 1) return `Yesterday, ${time(date)}`;
  if (days === -1) return `Tomorrow, ${time(date)}`;

  const day = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${day}, ${time(date)}`;
}

/** "Oct 5, 2026 at 8:00 AM" — the heading on a run. */
export function longDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${day} at ${time(date)}`;
}

/** "4m 12s" · "48s". Null while a run is still going. */
export function duration(ms: number | null): string | null {
  if (ms === null || ms < 0) return null;

  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

/** The second line of a run row: outcome plus how long it took. */
export function runDetailLine(run: {
  status: string;
  durationMs: number | null;
  error?: string | null;
}): string {
  const took = duration(run.durationMs);

  switch (run.status) {
    case "running":
      return "Running now";
    case "failed":
      return run.error ?? "Failed";
    case "skipped":
      return "Skipped";
    default:
      return took ? `Completed in ${took}` : "Completed";
  }
}
