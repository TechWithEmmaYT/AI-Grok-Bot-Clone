import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import type { ToolKey } from "@/db/app-schema";
import { TOOLS } from "@/lib/tools";
import { router } from "expo-router";
import { CalendarClock, Check, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { ToolCard } from "./tool-card";

export type ScheduleTaskProposal = {
  /** The task name the agent derived from the conversation. */
  task: string;
  /** Human reading of the cadence, e.g. "Every day at 8:00 AM". */
  schedule: string;
  /** Zone the time is read in — an hour with no zone is ambiguous. */
  timezone: string;
  tools: ToolKey[];
};

/** One labelled row of the summary table. */
function Row({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const body = (
    <>
      {/* Fixed label column so the values line up down the card. */}
      <Text variant="secondary" className="w-24">
        {label}
      </Text>
      <Text variant="body" className="flex-1">
        {value}
      </Text>
      {onPress ? <ChevronRight size={18} strokeWidth={1.75} color="#78809b" /> : null}
    </>
  );

  const className = cn(
    "flex-row items-center gap-3 px-4 py-3",
    !last && "border-b border-border",
  );

  if (!onPress) {
    return <View className={className}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      className={cn(className, "min-h-14")}
    >
      {body}
    </Pressable>
  );
}

/**
 * The agent proposing a scheduled task, and the receipt once it is accepted.
 *
 * Creating a recurring job is a side effect the user should agree to
 * explicitly, so nothing is scheduled until Confirm is pressed — the card
 * states exactly what will run, how often and with which tools first. After
 * confirming it collapses to a receipt rather than disappearing, so the
 * transcript still shows what was agreed.
 */
export function ScheduleTaskTool({
  proposal,
  confirmed: initiallyConfirmed = false,
  onConfirm,
  taskId,
}: {
  proposal: ScheduleTaskProposal;
  confirmed?: boolean;
  onConfirm?: () => void;
  /** Set once the task exists, so the receipt can link to it. */
  taskId?: string;
}) {
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);

  const toolLabels =
    TOOLS.filter((tool) => proposal.tools.includes(tool.key))
      .map((tool) => tool.label)
      .join(", ") || "No tools";

  if (confirmed) {
    return (
      <ToolCard
        icon={<Check size={18} strokeWidth={2.5} color="#00c755" />}
        label="Task scheduled"
        badge={{ label: "Active", tone: "done" }}
      >
        <View className="gap-1 px-4 pb-4">
          <Text variant="cardTitle">{proposal.task}</Text>
          <Text variant="secondary">
            {proposal.schedule} · {proposal.timezone}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${proposal.task}`}
          onPress={() =>
            taskId
              ? router.push({ pathname: "/task/[id]", params: { id: taskId } })
              : router.push("/tasks")
          }
          className="min-h-12 flex-row items-center justify-center gap-1 border-t border-border"
        >
          <Text variant="label" className="text-primary">
            View task
          </Text>
          <ChevronRight size={16} strokeWidth={2} color="#0268fe" />
        </Pressable>
      </ToolCard>
    );
  }

  return (
    <ToolCard
      icon={<CalendarClock size={18} strokeWidth={1.75} color="#0268fe" />}
      label="Schedule task"
      badge={{ label: "Needs confirmation", tone: "idle" }}
      footer={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Confirm ${proposal.task}, ${proposal.schedule}`}
          onPress={() => {
            setConfirmed(true);
            onConfirm?.();
          }}
          className="min-h-14 items-center justify-center bg-primary"
        >
          <Text variant="label" className="text-primary-foreground">
            Confirm
          </Text>
        </Pressable>
      }
    >
      <View className="border-t border-border">
        <Row label="Task" value={proposal.task} />
        <Row label="Schedule" value={`${proposal.schedule} · ${proposal.timezone}`} />
        <Row label="Tools" value={toolLabels} onPress={() => router.push("/connections")} />
        <Row label="Status" value="Not scheduled yet" last />
      </View>
    </ToolCard>
  );
}
