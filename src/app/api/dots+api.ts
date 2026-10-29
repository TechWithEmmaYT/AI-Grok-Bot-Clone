import { db } from "@/db";
import { dot, dotTool, type ToolKey } from "@/db/app-schema";
import { auth } from "@/lib/auth";
import { createDotSchema } from "@/lib/validation";
import { task } from "@/db/task-schema";
import { and, desc, eq, exists, inArray, sql } from "drizzle-orm";

/** Resolves the caller from the request cookies, or null when signed out. */
async function requireUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

const unauthorized = () =>
  Response.json({ error: "Not signed in" }, { status: 401 });

export async function GET(request: Request) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const status = new URL(request.url).searchParams.get("status");

  // "Scheduled" is not a column — it means the Dot has at least one task, so
  // it is asked as an EXISTS rather than stored and kept in sync.
  const scheduled = exists(
    db
      .select({ one: sql`1` })
      .from(task)
      .where(and(eq(task.dotId, dot.id), eq(task.userId, userId))),
  );

  // Always scoped by userId — never trust an id supplied by the caller.
  const rows = await db
    .select()
    .from(dot)
    .where(
      status === "archived"
        ? and(eq(dot.userId, userId), eq(dot.status, "archived"))
        : status === "active"
          ? and(eq(dot.userId, userId), eq(dot.status, "active"))
          : status === "scheduled"
            ? and(eq(dot.userId, userId), scheduled)
            : eq(dot.userId, userId),
    )
    .orderBy(desc(dot.updatedAt));

  if (rows.length === 0) return Response.json({ dots: [] });

  const tools = await db
    .select()
    .from(dotTool)
    .where(
      inArray(
        dotTool.dotId,
        rows.map((r) => r.id),
      ),
    );

  const byDot = new Map<string, ToolKey[]>();
  for (const t of tools) {
    if (!t.enabled) continue;
    byDot.set(t.dotId, [...(byDot.get(t.dotId) ?? []), t.toolKey]);
  }

  return Response.json({
    dots: rows.map((row) => ({ ...row, tools: byDot.get(row.id) ?? [] })),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId(request);
  if (!userId) return unauthorized();

  const parsed = createDotSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid Dot", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { name, shape, color, instructions, templateKey, tools } = parsed.data;
  const id = crypto.randomUUID();

  const [created] = await db
    .insert(dot)
    .values({ id, userId, name, shape, color, instructions, templateKey })
    .returning();

  if (tools.length > 0) {
    await db.insert(dotTool).values(
      tools.map((toolKey) => ({
        dotId: id,
        toolKey: toolKey as ToolKey,
        enabled: true,
      })),
    );
  }

  return Response.json({ dot: { ...created, tools } }, { status: 201 });
}
