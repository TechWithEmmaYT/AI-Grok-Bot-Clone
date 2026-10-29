import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { cn, Screen } from "@/components/ui/screen";
import { DotRowSkeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import {
  deleteTask,
  queryKeys,
  runTaskNow,
  taskQuery,
  updateTask,
  type RunStatus,
} from "@/lib/api";
import { dayAndTime, runDetailLine } from "@/lib/format";
import {
  CADENCES,
  cadenceOf,
  describeCron,
  describeTimezone,
  TIMES,
  timeOf,
  toCron,
  type Cadence,
} from "@/lib/schedule";
import { TOOLS } from "@/lib/tools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  MoreHorizontal,
  Pause,
  Play,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { toast } from "sonner-native";
import { useCSSVariable } from "uniwind";

const TABS = ["Recent runs", "Settings"] as const;

/** Status is never colour alone — each state carries its own glyph. */
function RunStatusDot({ status }: { status: RunStatus }) {
  if (status === "completed") {
    return (
      <View className="size-7 items-center justify-center rounded-pill bg-success">
        <Check size={16} strokeWidth={3} color="#ffffff" />
      </View>
    );
  }
  if (status === "failed") {
    return (
      <View className="size-7 items-center justify-center rounded-pill bg-destructive">
        <X size={16} strokeWidth={3} color="#ffffff" />
      </View>
    );
  }
  if (status === "running") {
    return (
      <View className="size-7 items-center justify-center rounded-pill bg-primary">
        <Play size={13} strokeWidth={3} color="#ffffff" fill="#ffffff" />
      </View>
    );
  }
  return (
    <View className="size-7 items-center justify-center rounded-pill bg-muted-foreground">
      <MoreHorizontal size={16} strokeWidth={3} color="#ffffff" />
    </View>
  );
}

// _designs/task-new-2.png
export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = id ?? "";
  const client = useQueryClient();

  const { data: task, isPending, error } = useQuery(taskQuery(taskId));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Recent runs");

  // Draft edits, held separately from the server copy. Null means "unchanged",
  // so a background refetch never clobbers what is being typed.
  const [draftPrompt, setDraftPrompt] = useState<string | null>(null);
  const [draftCadence, setDraftCadence] = useState<Cadence | null>(null);
  const [draftTime, setDraftTime] = useState<string | null>(null);

  const [primary, border, mutedText, foreground] = useCSSVariable([
    "--color-primary",
    "--color-border",
    "--color-muted-foreground",
    "--color-foreground",
  ]);

  const definition = useMemo(
    () => withLook(base, task?.shape ?? "blob", task?.color ?? "blue"),
    [task?.shape, task?.color],
  );

  const invalidate = () => {
    client.invalidateQueries({ queryKey: queryKeys.task(taskId) });
    client.invalidateQueries({ queryKey: queryKeys.tasks });
  };

  const save = useMutation({
    mutationFn: updateTask,
    onSuccess: invalidate,
    onError: (cause: Error) => toast.error(cause.message),
  });

  const runNow = useMutation({
    mutationFn: () => runTaskNow(taskId),
    onSuccess: () => {
      toast.success("Run started");
      invalidate();
    },
    onError: (cause: Error) => toast.error(cause.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.tasks });
      // A Dot losing its last task changes the Home "Scheduled" filter.
      client.invalidateQueries({ queryKey: queryKeys.allDots });
      router.replace("/tasks");
    },
    onError: (cause: Error) => toast.error(cause.message),
  });

  if (isPending) {
    return (
      <Screen edges={["top"]} contentClassName="gap-3 px-5 pt-16">
        <DotRowSkeleton />
        <DotRowSkeleton />
        <DotRowSkeleton />
      </Screen>
    );
  }

  if (error || !task) {
    return (
      <Screen edges={["top"]} contentClassName="items-center justify-center gap-2 px-5">
        <Text variant="cardTitle">Task not found</Text>
        <Text variant="secondary" className="text-center">
          {error?.message ?? "It may have been deleted."}
        </Text>
      </Screen>
    );
  }

  const prompt = draftPrompt ?? task.prompt;
  const cadence = draftCadence ?? cadenceOf(task.cronExpression);
  const time = draftTime ?? timeOf(task.cronExpression);
  const dirty = prompt !== task.prompt || toCron(cadence, time) !== task.cronExpression;

  const toolLabels =
    TOOLS.filter((tool) => task.tools.includes(tool.key))
      .map((tool) => tool.label)
      .join(", ") || "No tools enabled";

  return (
    <Screen edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/tasks"))}
          className="-ml-2 size-11 items-center justify-center"
        >
          <ChevronLeft size={24} strokeWidth={1.75} color="#111111" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More options"
          hitSlop={10}
          className="size-11 items-center justify-center"
        >
          <MoreHorizontal size={22} strokeWidth={1.75} color="#111111" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-8 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-4">
          <DotAvatar
            definition={definition}
            size={56}
            still
            float={false}
            label={`${task.dotName}, ${task.color}`}
          />
          <View className="flex-1">
            <Text variant="title">{task.name}</Text>
            <Text variant="secondary">{task.dotName}</Text>
          </View>
          <Switch
            value={task.enabled}
            onValueChange={(enabled) => save.mutate({ id: taskId, enabled })}
            accessibilityLabel={`${task.name} enabled`}
            trackColor={{ true: primary as string, false: border as string }}
            thumbColor="#ffffff"
          />
        </View>

        <View className="gap-4 rounded-card bg-muted p-4">
          <View className="flex-row gap-3">
            <Calendar size={20} strokeWidth={1.75} color="#0268fe" />
            <View className="flex-1">
              <Text variant="body">{describeCron(task.cronExpression)}</Text>
              <Text variant="secondary">
                {!task.enabled
                  ? "Paused"
                  : task.nextRunAt
                    ? `Next run ${dayAndTime(task.nextRunAt)}`
                    : describeTimezone(task.timezone)}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Globe size={20} strokeWidth={1.75} color="#0268fe" />
            <Text variant="body" className="flex-1">
              {toolLabels}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <FileText size={20} strokeWidth={1.75} color="#0268fe" />
            <Text variant="body" className="flex-1">
              {task.prompt}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {TABS.map((name) => {
            const selected = name === tab;
            return (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setTab(name)}
                className={cn(
                  "h-10 justify-center rounded-pill px-4",
                  selected ? "bg-secondary" : "bg-muted",
                )}
              >
                <Text
                  variant="label"
                  className={selected ? "text-secondary-foreground" : "text-muted-foreground"}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === "Recent runs" ? (
          <View className="gap-3">
            <Text variant="section">Recent runs</Text>

            {task.runs.length === 0 ? (
              <View className="items-center gap-2 rounded-card border border-border bg-card px-5 py-10">
                <Text variant="cardTitle">No runs yet</Text>
                <Text variant="secondary" className="text-center">
                  Use Run now to try this task without waiting for its schedule.
                </Text>
              </View>
            ) : (
              <View className="overflow-hidden rounded-card border border-border bg-card">
                {task.runs.map((run, index) => (
                  <Pressable
                    key={run.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${dayAndTime(run.startedAt)}, ${runDetailLine(run)}`}
                    onPress={() =>
                      router.push({ pathname: "/run/[id]", params: { id: run.id } })
                    }
                    className={cn(
                      "min-h-16 flex-row items-center gap-3 px-4 py-3",
                      index > 0 && "border-t border-border",
                    )}
                  >
                    <RunStatusDot status={run.status} />
                    <View className="flex-1">
                      <Text variant="cardTitle">{dayAndTime(run.startedAt)}</Text>
                      <Text variant="secondary">{runDetailLine(run)}</Text>
                    </View>
                    <ChevronRight size={20} strokeWidth={1.75} color="#78809b" />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="gap-5">
            <View className="gap-3">
              <Text variant="section">What should this task do?</Text>
              <TextInput
                multiline
                value={prompt}
                onChangeText={setDraftPrompt}
                placeholderTextColor={mutedText as string}
                selectionColor={foreground as string}
                accessibilityLabel="What should this task do?"
                textAlignVertical="top"
                className="min-h-28 rounded-control border border-border bg-card p-4 font-sans text-[16px] leading-6 text-foreground"
              />
            </View>

            <View className="gap-3">
              <Text variant="section">Schedule</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Repeats: ${cadence}`}
                onPress={() =>
                  setDraftCadence(CADENCES[(CADENCES.indexOf(cadence) + 1) % CADENCES.length])
                }
                className="min-h-14 flex-row items-center gap-3 rounded-control border border-border bg-card px-4"
              >
                <Calendar size={20} strokeWidth={1.75} color="#0268fe" />
                <Text variant="body" className="flex-1">
                  {cadence}
                </Text>
                <ChevronRight size={20} strokeWidth={1.75} color="#78809b" />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Time: ${time}`}
                onPress={() => {
                  const index = TIMES.indexOf(time as (typeof TIMES)[number]);
                  setDraftTime(TIMES[(index + 1) % TIMES.length]);
                }}
                className="min-h-14 flex-row items-center gap-3 rounded-control border border-border bg-card px-4"
              >
                <Clock size={20} strokeWidth={1.75} color="#0268fe" />
                <View className="flex-1">
                  <Text variant="body">{time}</Text>
                  <Text variant="secondary">{describeTimezone(task.timezone)}</Text>
                </View>
                <ChevronRight size={20} strokeWidth={1.75} color="#78809b" />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !dirty || save.isPending }}
              accessibilityLabel="Save changes"
              disabled={!dirty || save.isPending}
              onPress={() =>
                save.mutate(
                  {
                    id: taskId,
                    prompt: prompt.trim(),
                    cronExpression: toCron(cadence, time),
                  },
                  {
                    onSuccess: () => {
                      // Hand control back to the server copy now they agree.
                      setDraftPrompt(null);
                      setDraftCadence(null);
                      setDraftTime(null);
                      toast.success("Task updated");
                    },
                  },
                )
              }
              className={cn(
                "min-h-14 items-center justify-center rounded-control bg-primary",
                (!dirty || save.isPending) && "opacity-40",
              )}
            >
              <Text variant="label" className="text-primary-foreground">
                {save.isPending ? "Saving…" : "Save changes"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete task"
              disabled={remove.isPending}
              onPress={() => remove.mutate()}
              className="min-h-14 items-center justify-center rounded-control bg-destructive-muted"
            >
              <Text variant="label" className="text-destructive">
                Delete task
              </Text>
            </Pressable>
          </View>
        )}

        <View className="flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Run now"
            disabled={runNow.isPending}
            onPress={() => runNow.mutate()}
            className={cn(
              "min-h-14 flex-1 flex-row items-center justify-center gap-2 rounded-control bg-secondary",
              runNow.isPending && "opacity-40",
            )}
          >
            <Play size={18} strokeWidth={2} color="#0268fe" fill="#0268fe" />
            <Text variant="label" className="text-primary">
              {runNow.isPending ? "Starting…" : "Run now"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={task.enabled ? "Pause task" : "Resume task"}
            onPress={() => save.mutate({ id: taskId, enabled: !task.enabled })}
            className="min-h-14 flex-1 flex-row items-center justify-center gap-2 rounded-control bg-destructive-muted"
          >
            {task.enabled ? (
              <Pause size={18} strokeWidth={2} color="#ff3b30" fill="#ff3b30" />
            ) : (
              <Play size={18} strokeWidth={2} color="#ff3b30" fill="#ff3b30" />
            )}
            <Text variant="label" className="text-destructive">
              {task.enabled ? "Pause" : "Resume"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
