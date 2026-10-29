import type { UIMessage } from "ai";
import { memo } from "react";
import { View } from "react-native";
import { AssistantMessage, UserMessage } from "./message-bubble";
import { GenericTool } from "./tools/generic-tool";
import {
  ScheduleTaskTool,
  type ScheduleTaskProposal,
} from "./tools/schedule-task-tool";
import type { StepStatus } from "./types";
import type { ToolKey } from "@/db/app-schema";

/** AI SDK tool part states mapped onto our visual vocabulary. */
function toolStatus(state: string): StepStatus {
  if (state === "output-available") return "done";
  if (state === "output-error") return "error";
  if (state === "input-streaming") return "pending";
  return "running";
}

/**
 * One turn. Memoized on purpose: while a response streams, only the last
 * message changes, and without this every earlier message would re-render on
 * each chunk — the main cause of janky chat on React Native.
 */
export const MessageRow = memo(function MessageRow({
  message,
  sentAt,
}: {
  message: UIMessage;
  sentAt: string;
}) {
  if (message.role === "user") {
    const text = message.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("");
    return <UserMessage text={text} sentAt={sentAt} />;
  }

  return (
    <View className="gap-3">
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;

        // Reasoning is surfaced live by ThinkingRow while the turn is in
        // flight, and intentionally not repeated once the answer lands.
        if (part.type === "reasoning") return null;

        if (part.type === "text") {
          return "text" in part && part.text ? (
            <AssistantMessage key={key} text={part.text} />
          ) : null;
        }

        // Tool parts arrive as `tool-<name>`; the generic surface covers any
        // tool that has not earned a bespoke view yet.
        if (part.type.startsWith("tool-")) {
          const name = part.type.slice("tool-".length);
          const state = "state" in part ? String(part.state) : "input-available";

          // Scheduling is a side effect, so it gets its own confirm-first
          // surface instead of the generic output dump.
          if (name === "schedule_task") {
            const proposal = ("input" in part ? part.input : undefined) as
              | ScheduleTaskProposal
              | undefined;
            if (!proposal?.task) return null;
            const output = ("output" in part ? part.output : undefined) as
              | { taskId?: string }
              | undefined;
            return (
              <ScheduleTaskTool
                key={key}
                proposal={proposal}
                confirmed={state === "output-available"}
                taskId={output?.taskId}
              />
            );
          }

          return (
            <GenericTool
              key={key}
              toolKey={name as ToolKey}
              title={name.replace(/_/g, " ")}
              status={toolStatus(state)}
              output={
                "output" in part && part.output
                  ? JSON.stringify(part.output, null, 2)
                  : undefined
              }
            />
          );
        }

        return null;
      })}
    </View>
  );
});
