import { db } from "@/db";
import { dot } from "@/db/app-schema";
import { auth } from "@/lib/auth";
import { chat, defaultStorage } from "@trigger.dev/sdk/ai";
import { and, eq } from "drizzle-orm";

/**
 * Reads a conversation back from the platform's transcript storage — the same
 * snapshot the agent writes after every turn. Without this the screen starts
 * empty on every mount, because the message list only ever held what the
 * current session streamed.
 *
 * Reading the store from the device would mean shipping the secret key, so the
 * read happens here and is scoped to the caller's own dot.
 */
const loadTranscript = chat.createLoadTranscriptAction(defaultStorage, { limit: 50 });

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { chatId, limit, before } = (await request.json()) as {
    chatId?: string;
    limit?: number;
    before?: string;
  };
  if (!chatId) return Response.json({ error: "chatId is required" }, { status: 400 });

  const [owned] = await db
    .select({ id: dot.id })
    .from(dot)
    .where(and(eq(dot.id, chatId), eq(dot.userId, session.user.id)))
    .limit(1);

  if (!owned) return Response.json({ error: "Dot not found" }, { status: 404 });

  return Response.json(await loadTranscript({ chatId, limit, before }));
}
