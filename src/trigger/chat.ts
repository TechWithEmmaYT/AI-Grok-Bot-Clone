import { gateway } from "@ai-sdk/gateway";
import { chat } from "@trigger.dev/sdk/ai";
import { stepCountIs } from "ai";

/**
 * The Dot conversation, as one long-lived Trigger.dev task.
 *
 * It wakes when a message arrives and freezes when none do, so in-memory state
 * survives refreshes, deploys, idle gaps and crashes. There is no chat API
 * route — the app talks to this through TriggerChatTransport, and history
 * accumulates server-side so each turn ships only the new message.
 *
 * The transcript is persisted by the platform's default storage, which is what
 * /api/chat/transcript reads back when the screen remounts.
 */

// Routed through Vercel AI Gateway so the model can change without a new
// provider key. Override with AI_GATEWAY_MODEL in .env.
const MODEL = process.env.AI_GATEWAY_MODEL ?? "anthropic/claude-sonnet-5.5";

export const dotChat = chat.agent({
  id: "dot-chat",
  uiMessageStreamOptions: {
    // Defaults to true, but it is the whole point of enabling thinking below,
    // so it is stated rather than inherited.
    sendReasoning: true,
    // Never surface the raw error — it leaks keys and stack traces.
    onError: () => "Something went wrong. Please try again.",
  },
  // `streamText` comes from the run argument, never the `ai` import: the SDK's
  // copy carries compaction, steering, background injection, the system prompt
  // and telemetry. The imported one carries none of it, with no error.
  run: async ({ messages, signal, streamText }) =>
    streamText({
      model: gateway(MODEL),
      messages,
      // Without this, Stop updates the UI but the model keeps generating.
      abortSignal: signal,
      stopWhen: stepCountIs(15),
      providerOptions: {
        // Keyed by the underlying provider, not "gateway". Adaptive is the
        // only thinking mode the Claude 5 models accept — a fixed
        // `budgetTokens` is rejected with a 400.
        anthropic: { thinking: { type: "adaptive" } },
      },
    }),
});
