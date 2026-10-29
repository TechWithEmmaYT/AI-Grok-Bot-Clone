import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_wlqpwtbrdplcglclcftd",
  dirs: ["./src/trigger"],
  // Chat sessions are long-lived: an agent run stays alive across a whole
  // conversation, idling between turns rather than finishing after one.
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      randomize: true,
    },
  },
});
