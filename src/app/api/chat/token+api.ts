import { db } from "@/db";
import { dot } from "@/db/app-schema";
import { auth } from "@/lib/auth";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { and, eq } from "drizzle-orm";

/**
 * Pure mint. The transport calls this on 401/403 to refresh an expired token.
 * Minting in the app would mean shipping the environment secret key to the
 * device, so it only ever happens here.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { chatId } = (await request.json()) as { chatId?: string };
  if (!chatId) return Response.json({ error: "chatId is required" }, { status: 400 });

  const [owned] = await db
    .select({ id: dot.id })
    .from(dot)
    .where(and(eq(dot.id, chatId), eq(dot.userId, session.user.id)))
    .limit(1);

  if (!owned) return Response.json({ error: "Dot not found" }, { status: 404 });

  const token = await triggerAuth.createPublicToken({
    scopes: { read: { sessions: chatId }, write: { sessions: chatId } },
    expirationTime: "1h",
  });

  return Response.json({ token });
}
