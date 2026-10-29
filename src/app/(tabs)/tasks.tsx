import { TaskRow } from "@/components/tasks/task-row";
import { cn, Screen } from "@/components/ui/screen";
import { DotRowSkeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { queryKeys, tasksQuery, updateTask, type TaskStatus } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { toast } from "sonner-native";

const SEGMENTS: { key: TaskStatus; label: string }[] = [
  { key: "scheduled", label: "Scheduled" },
  { key: "running", label: "Running" },
  { key: "paused", label: "Paused" },
];

// _designs/tasks-screen.png
export default function Tasks() {
  const [segment, setSegment] = useState<TaskStatus>("scheduled");
  const client = useQueryClient();

  const { data: tasks = [], isPending, error, refetch, isRefetching } = useQuery(tasksQuery());

  const toggle = useMutation({
    mutationFn: updateTask,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.tasks }),
    onError: (cause: Error) => toast.error(cause.message),
  });

  const visible = useMemo(
    () => tasks.filter((item) => item.status === segment),
    [tasks, segment],
  );

  return (
    <Screen edges={["top"]}>
      <View className="flex-row items-start justify-between px-5 pb-2 pt-2">
        <View className="flex-1 pr-4">
          <Text variant="display">Tasks</Text>
          <Text variant="secondary" className="mt-1">
            All scheduled, running and completed tasks across your Dots.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a new task"
          onPress={() => router.push("/task/new")}
          className="size-11 items-center justify-center rounded-pill bg-primary"
        >
          <Plus size={24} strokeWidth={2} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 py-2"
        className="max-h-14 grow-0"
      >
        {SEGMENTS.map(({ key, label }) => {
          const selected = key === segment;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setSegment(key)}
              className={cn(
                "h-10 justify-center rounded-pill px-5",
                selected ? "bg-primary" : "bg-muted",
              )}
            >
              <Text
                variant="label"
                className={selected ? "text-primary-foreground" : "text-muted-foreground"}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerClassName="px-5 pb-8 gap-2"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isPending ? (
          <>
            <DotRowSkeleton />
            <DotRowSkeleton />
            <DotRowSkeleton />
          </>
        ) : error ? (
          <View className="items-center gap-2 py-16">
            <Text variant="cardTitle">Could not load tasks</Text>
            <Text variant="secondary" className="text-center">
              {error.message}
            </Text>
          </View>
        ) : visible.length === 0 ? (
          <View className="items-center gap-2 py-16">
            <Text variant="cardTitle">No {segment} tasks</Text>
            <Text variant="secondary" className="text-center">
              Tasks you schedule for your Dots appear here.
            </Text>
          </View>
        ) : (
          visible.map((item) => (
            <TaskRow
              key={item.id}
              task={item}
              onPress={() => router.push({ pathname: "/task/[id]", params: { id: item.id } })}
              onToggle={(enabled) => toggle.mutate({ id: item.id, enabled })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
