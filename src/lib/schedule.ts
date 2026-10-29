/**
 * Translation between what the Tasks UI shows and what Trigger.dev schedules.
 *
 * The database stores a cron expression and an IANA timezone; every screen
 * shows a sentence. Keeping both directions here means the pickers and the
 * rows can never drift apart, and the cron is written in exactly one place.
 */

export type Cadence =
  | "Every day"
  | "Weekdays"
  | "Every Monday"
  | "Every Friday"
  | "Every 6 hours"
  | "Every hour";

export const CADENCES: Cadence[] = [
  "Every day",
  "Weekdays",
  "Every Monday",
  "Every Friday",
  "Every 6 hours",
  "Every hour",
];

export const TIMES = [
  "6:00 AM",
  "8:00 AM",
  "9:00 AM",
  "12:00 PM",
  "5:00 PM",
  "6:00 PM",
] as const;

/** IANA zones, paired with the label the UI shows. */
export const TIMEZONES: { label: string; value: string }[] = [
  { label: "Local time", value: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
  { label: "UTC", value: "UTC" },
  { label: "US Eastern", value: "America/New_York" },
  { label: "US Pacific", value: "America/Los_Angeles" },
];

/** "8:00 AM" -> 8. Returns null when the string is not one we offer. */
function hourOf(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;

  const raw = Number(match[1]) % 12;
  return match[3].toUpperCase() === "PM" ? raw + 12 : raw;
}

/**
 * Build the cron for a cadence and time. The interval cadences ignore the
 * time by design — "every 6 hours" has no single hour to anchor to.
 */
export function toCron(cadence: Cadence, time: string): string {
  if (cadence === "Every hour") return "0 * * * *";
  if (cadence === "Every 6 hours") return "0 */6 * * *";

  const hour = hourOf(time) ?? 9;

  switch (cadence) {
    case "Weekdays":
      return `0 ${hour} * * 1-5`;
    case "Every Monday":
      return `0 ${hour} * * 1`;
    case "Every Friday":
      return `0 ${hour} * * 5`;
    default:
      return `0 ${hour} * * *`;
  }
}

const DAY_NAMES: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};

function formatHour(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
}

/**
 * Human reading of a stored cron, e.g. "Every day at 8:00 AM".
 *
 * Only the expressions this app writes are understood; anything else falls
 * back to the raw cron rather than guessing, so an unexpected value is
 * visible instead of silently mis-described.
 */
export function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;

  const [minute, hour, , , weekday] = parts;
  if (minute !== "0") return cron;

  if (hour === "*") return "Every hour";
  if (hour.startsWith("*/")) return `Every ${hour.slice(2)} hours`;

  const parsed = Number(hour);
  if (!Number.isInteger(parsed)) return cron;
  const at = formatHour(parsed);

  if (weekday === "*") return `Every day at ${at}`;
  if (weekday === "1-5") return `Weekdays at ${at}`;
  if (DAY_NAMES[weekday]) return `Every ${DAY_NAMES[weekday]} at ${at}`;

  return cron;
}

/** The cadence a stored cron came from, so the editor opens on the right one. */
export function cadenceOf(cron: string): Cadence {
  const description = describeCron(cron);
  if (description === "Every hour") return "Every hour";
  if (description.startsWith("Every 6 hours")) return "Every 6 hours";
  if (description.startsWith("Weekdays")) return "Weekdays";
  if (description.startsWith("Every Monday")) return "Every Monday";
  if (description.startsWith("Every Friday")) return "Every Friday";
  return "Every day";
}

/** The time a stored cron came from, matched against the offered options. */
export function timeOf(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  const hour = Number(parts[1]);
  if (!Number.isInteger(hour)) return TIMES[1];

  const formatted = formatHour(hour);
  return TIMES.includes(formatted as (typeof TIMES)[number]) ? formatted : TIMES[1];
}

/** Short label for a zone value, falling back to the raw IANA name. */
export function describeTimezone(value: string): string {
  return TIMEZONES.find((zone) => zone.value === value)?.label ?? value;
}
