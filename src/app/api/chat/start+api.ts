import { db } from "@/db";
import { dot } from "@/db/app-schema";
import { auth } from "@/lib/auth";
import { chat } from "@trigger.dev/sdk/ai";
import { and, eq } from "drizzle-orm";

// Creates the Session and its first run, returning a session token.
// Idempotent on (environment, chatId).
const startSession = chat.createStartSessionAction("dot-chat");

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { chatId, clientData } = (await request.json()) as {
    chatId?: string;
    clientData?: unknown;
  };
  if (!chatId) return Response.json({ error: "chatId is required" }, { status: 400 });

  // chatId is the Dot id. Without this check any signed-in user could open a
  // session against someone else's conversation.
  const [owned] = await db
    .select({ id: dot.id })
    .from(dot)
    .where(and(eq(dot.id, chatId), eq(dot.userId, session.user.id)))
    .limit(1);

  if (!owned) return Response.json({ error: "Dot not found" }, { status: 404 });

  return Response.json(await startSession({ chatId, clientData }));
}
