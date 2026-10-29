import { logger, task } from "@trigger.dev/sdk";

/**
 * Smoke test for the setup — fire it from the task's test page in the
 * dashboard to confirm registration works end to end.
 */
export const helloWorld = task({
  id: "hello-world",
  run: async (payload: { name?: string }) => {
    const name = payload.name ?? "world";
    logger.info("Saying hello", { name });
    return { message: `Hello ${name}!` };
  },
});
