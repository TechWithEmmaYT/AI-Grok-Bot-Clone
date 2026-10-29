import {
  useTriggerChatTransport,
  type LoadTranscriptResult,
} from "@trigger.dev/sdk/chat/react";
import { fetch as expoFetch } from "expo/fetch";
import type { dotChat } from "@/trigger/chat";
import { authClient } from "./auth-client";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";

/** Our API routes, with the Better Auth session attached. */
async function post<T>(path: string, body: unknown): Promise<T> {
  const cookie = await authClient.getCookie();

  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const parsed = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(parsed?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

/**
 * Transport for a Dot conversation.
 *
 * The `fetch` override is the part that makes this work on React Native at
 * all. The transport reads the agent's output from an SSE endpoint, which
 * needs a streaming response body — and RN's built-in fetch always resolves
 * `response.body` to null, so the stream would never produce a chunk. Expo's
 * fetch returns a real ReadableStream, so the override routes both the append
 * POSTs and the SSE GET through it.
 *
 * Tokens are minted server-side only: putting the environment secret key in
 * the app bundle would hand every user full access to the Trigger project.
 */
export function useDotChatTransport(chatId: string) {
  return useTriggerChatTransport<typeof dotChat>({
    task: "dot-chat",
    fetch: (url, init) =>
      expoFetch(url, init as Parameters<typeof expoFetch>[1]) as unknown as Promise<Response>,
    accessToken: async ({ chatId: id }) => {
      const { token } = await post<{ token: string }>("/api/chat/token", { chatId: id });
      return token;
    },
    startSession: ({ chatId: id, clientData }) =>
      post("/api/chat/start", { chatId: id, clientData }),
  });
}

/**
 * History for a conversation, as `useLoadTranscript` expects it. Passed to
 * `useChat` as its initial messages so a remount resumes the thread instead of
 * starting blank.
 */
export function loadDotTranscript({
  chatId,
  limit,
}: {
  chatId: string;
  limit?: number;
}) {
  return post<LoadTranscriptResult>("/api/chat/transcript", { chatId, limit });
}

export const chatIdForDot = (dotId: string) => dotId;
