import { MarkdownBody } from "@/components/chat/markdown-body";
import { RunTimeline } from "@/components/tasks/run-timeline";
import { cn, Screen } from "@/components/ui/screen";
import { DotRowSkeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { queryKeys, runQuery, runTaskNow } from "@/lib/api";
import { duration, longDateTime } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { toast } from "sonner-native";

// _designs/task-new-3.png
export default function RunDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const runId = id ?? "";
  const client = useQueryClient();

  const { data: run, isPending, error } = useQuery(runQuery(runId));
  const [tab, setTab] = useState<"summary" | "sources" | "files">("summary");

  const retry = useMutation({
    mutationFn: () => runTaskNow(run?.taskId ?? ""),
    onSuccess: () => {
      toast.success("Run started");
      client.invalidateQueries({ queryKey: queryKeys.tasks });
      router.back();
    },
    onError: (cause: Error) => toast.error(cause.message),
  });

  if (isPending) {
    return (
      <Screen edges={["top"]} contentClassName="gap-3 px-5 pt-16">
        <DotRowSkeleton />
        <DotRowSkeleton />
      </Screen>
    );
  }

  if (error || !run) {
    return (
      <Screen edges={["top"]} contentClassName="items-center justify-center gap-2 px-5">
        <Text variant="cardTitle">Run not found</Text>
        <Text variant="secondary" className="text-center">
          {error?.message ?? "It may have been deleted."}
        </Text>
      </Screen>
    );
  }

  const failed = run.status === "failed";
  const running = run.status === "running";
  const took = duration(run.durationMs);

  const TABS = [
    { key: "summary" as const, label: "Summary" },
    { key: "sources" as const, label: `Sources (${run.sources.length})` },
    { key: "files" as const, label: "Files" },
  ];

  return (
    <Screen edges={["top"]}>
      <View className="flex-row items-center px-5 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/tasks"))}
          className="-ml-2 size-11 items-center justify-center"
        >
          <ChevronLeft size={24} strokeWidth={1.75} color="#111111" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-8 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          {/* Status carries its own glyph and word, never colour alone. */}
          <View
            className={cn(
              "flex-row items-center gap-1.5 self-start rounded-pill px-3 py-1.5",
              failed ? "bg-destructive-muted" : running ? "bg-secondary" : "bg-success-muted",
            )}
          >
            {failed ? (
              <TriangleAlert size={14} strokeWidth={2.5} color="#ff3b30" />
            ) : running ? (
              <Play size={12} strokeWidth={2.5} color="#0268fe" fill="#0268fe" />
            ) : (
              <Sparkles size={14} strokeWidth={2.5} color="#00c755" />
            )}
            <Text
              variant="label"
              className={
                failed ? "text-destructive" : running ? "text-primary" : "text-success"
              }
            >
              {failed ? "Failed" : running ? "Running" : "Completed"}
            </Text>
          </View>

          <Text variant="title">{run.taskName}</Text>
          <Text variant="secondary">
            {longDateTime(run.startedAt)}
            {took ? ` · Took ${took}` : ""}
          </Text>
        </View>

        <RunTimeline steps={run.steps} error={run.error ?? undefined} />

        {failed ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry run"
            disabled={retry.isPending}
            onPress={() => retry.mutate()}
            className={cn(
              "min-h-14 flex-row items-center justify-center gap-2 rounded-control bg-primary",
              retry.isPending && "opacity-40",
            )}
          >
            <RotateCcw size={18} strokeWidth={2} color="#ffffff" />
            <Text variant="label" className="text-primary-foreground">
              {retry.isPending ? "Starting…" : "Retry run"}
            </Text>
          </Pressable>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {TABS.map(({ key, label }) => {
            const selected = key === tab;
            return (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setTab(key)}
                className={cn(
                  "h-10 justify-center rounded-pill px-4",
                  selected ? "bg-secondary" : "bg-muted",
                )}
              >
                <Text
                  variant="label"
                  className={selected ? "text-secondary-foreground" : "text-muted-foreground"}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === "summary" ? (
          run.summary ? (
            <View className="gap-3 rounded-card border border-border bg-card p-4">
              <View className="size-9 items-center justify-center rounded-tile bg-[#f3e9fe]">
                <Sparkles size={18} strokeWidth={2} color="#a246f9" />
              </View>
              {/* The summary is Markdown from the model, not plain text. */}
              <MarkdownBody value={run.summary} />
            </View>
          ) : (
            <View className="items-center gap-2 rounded-card border border-border bg-card px-5 py-10">
              <Text variant="cardTitle">{running ? "Still running" : "No summary"}</Text>
              <Text variant="secondary" className="text-center">
                {running
                  ? "The report appears here as soon as the run finishes."
                  : "The run stopped before it produced a report."}
              </Text>
            </View>
          )
        ) : null}

        {tab === "sources" ? (
          run.sources.length > 0 ? (
            <View className="overflow-hidden rounded-card border border-border bg-card">
              {run.sources.map((source, index) => (
                <View
                  key={source.id}
                  className={cn(
                    "flex-row items-center gap-3 px-4 py-3",
                    index > 0 && "border-t border-border",
                  )}
                >
                  <View className="size-9 items-center justify-center rounded-tile bg-muted">
                    <Text variant="label" className="text-muted-foreground">
                      {source.host.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="cardTitle">{source.name}</Text>
                    <Text variant="secondary">{source.host}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center gap-2 rounded-card border border-border bg-card px-5 py-10">
              <Text variant="cardTitle">No sources</Text>
              <Text variant="secondary" className="text-center">
                This run did not cite anything.
              </Text>
            </View>
          )
        ) : null}

        {tab === "files" ? (
          <View className="items-center gap-2 rounded-card border border-border bg-card px-5 py-10">
            <FileText size={22} strokeWidth={1.75} color="#78809b" />
            <Text variant="cardTitle">No files</Text>
            <Text variant="secondary" className="text-center">
              Attachments arrive with the file tooling, which is not built yet.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
