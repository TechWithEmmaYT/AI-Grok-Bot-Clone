import type { DotColor, DotShape } from "@/components/dots/dotLooks";
import type { DotStatus, ToolKey } from "@/db/app-schema";
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "./auth-client";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

/**
 * fetch against our own API routes with the Better Auth session attached.
 *
 * The native client keeps its cookies in SecureStore rather than a cookie jar,
 * so a plain fetch would arrive signed out. getCookie() hands us the header.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const cookie = await authClient.getCookie();

  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

/* ------------------------------------------------------------------ types */

export type Dot = {
  id: string;
  name: string;
  shape: DotShape;
  color: DotColor;
  instructions: string;
  templateKey: string | null;
  status: DotStatus;
  createdAt: string;
  updatedAt: string;
  tools: ToolKey[];
};

export type DotFilter = "all" | "active" | "scheduled" | "archived";

export type CreateDotInput = {
  name: string;
  shape: DotShape;
  color: DotColor;
  instructions?: string;
  templateKey?: string | null;
  tools?: ToolKey[];
};

/* ------------------------------------------------------------------- keys */

export const queryKeys = {
  dots: (filter: DotFilter) => ["dots", filter] as const,
  // Prefix for invalidating every filter at once after a write.
  allDots: ["dots"] as const,
  tasks: ["tasks"] as const,
  task: (id: string) => ["tasks", id] as const,
  run: (id: string) => ["runs", id] as const,
};

/* ---------------------------------------------------------------- queries */

// "scheduled" is resolved server-side as "has at least one task".
const statusParam = (filter: DotFilter) => (filter === "all" ? "" : `?status=${filter}`);

export function dotsQuery(filter: DotFilter) {
  return queryOptions({
    queryKey: queryKeys.dots(filter),
    queryFn: async () => {
      const { dots } = await request<{ dots: Dot[] }>(`/api/dots${statusParam(filter)}`);
      return dots;
    },
  });
}

/* -------------------------------------------------------------- mutations */

export async function createDot(input: CreateDotInput): Promise<Dot> {
  const { dot } = await request<{ dot: Dot }>("/api/dots", {
    method: "POST",
    body: JSON.stringify({
      instructions: "",
      templateKey: null,
      tools: [],
      ...input,
    }),
  });
  return dot;
}

/* ------------------------------------------------------- tasks and runs */

export type TaskStatus = "scheduled" | "running" | "paused";
export type RunStatus = "running" | "completed" | "failed" | "skipped";

export type RunStep = {
  id: string;
  title: string;
  detail?: string;
  /** ISO timestamp; the UI formats it. */
  at: string;
  icon: "start" | "search" | "browse" | "write" | "done" | "failed";
};

export type RunSource = { id: string; name: string; host: string };

export type TaskRun = {
  id: string;
  taskId: string;
  status: RunStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  summary: string | null;
  error: string | null;
  steps: RunStep[];
  sources: RunSource[];
};

export type Task = {
  id: string;
  name: string;
  prompt: string;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  nextRunAt: string | null;
  dotId: string;
  dotName: string;
  shape: DotShape;
  color: DotColor;
  status: TaskStatus;
  /** The Dot's enabled tools — what this task is able to do. */
  tools: ToolKey[];
  runs: TaskRun[];
};

export type RunDetail = TaskRun & {
  taskName: string;
  dotName: string;
  shape: DotShape;
  color: DotColor;
};

export type CreateTaskInput = {
  dotId: string;
  name: string;
  prompt: string;
  cronExpression: string;
  timezone: string;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "dotId">> & {
  enabled?: boolean;
};

export function tasksQuery() {
  return queryOptions({
    queryKey: queryKeys.tasks,
    queryFn: async () => {
      const { tasks } = await request<{ tasks: Task[] }>("/api/tasks");
      return tasks;
    },
  });
}

export function taskQuery(id: string) {
  return queryOptions({
    queryKey: queryKeys.task(id),
    queryFn: async () => {
      const { task } = await request<{ task: Task }>(`/api/tasks/${id}`);
      return task;
    },
    enabled: id.length > 0,
  });
}

export function runQuery(id: string) {
  return queryOptions({
    queryKey: queryKeys.run(id),
    queryFn: async () => {
      const { run } = await request<{ run: RunDetail }>(`/api/runs/${id}`);
      return run;
    },
    enabled: id.length > 0,
    // A run in flight changes under us; the screen polls while it does.
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 5_000 : false,
  });
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { task } = await request<{ task: Task }>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return task;
}

export async function updateTask({
  id,
  ...patch
}: UpdateTaskInput & { id: string }): Promise<Task> {
  const { task } = await request<{ task: Task }>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await request(`/api/tasks/${id}`, { method: "DELETE" });
}

/** Fires the task off-schedule; resolves once Trigger has accepted it. */
export async function runTaskNow(id: string): Promise<{ triggerRunId: string }> {
  return request<{ triggerRunId: string }>(`/api/tasks/${id}/run`, { method: "POST" });
}
