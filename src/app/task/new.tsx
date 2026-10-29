import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { Button } from "@/components/ui/button";
import { cn, Screen } from "@/components/ui/screen";
import { DotRowSkeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import {
  createTask,
  dotsQuery,
  queryKeys,
  type Dot,
} from "@/lib/api";
import { CADENCES, TIMES, TIMEZONES, toCron, type Cadence } from "@/lib/schedule";
import { TOOLS } from "@/lib/tools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { toast } from "sonner-native";
import { useCSSVariable } from "uniwind";

function DotCard({
  dot,
  selected,
  onPress,
}: {
  dot: Dot;
  selected: boolean;
  onPress: () => void;
}) {
  const definition = useMemo(() => withLook(base, dot.shape, dot.color), [dot.shape, dot.color]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={dot.name}
      onPress={onPress}
      className={cn(
        "w-24 items-center gap-2 rounded-card border bg-card px-2 py-3",
        selected ? "border-primary" : "border-border",
      )}
    >
      <DotAvatar definition={definition} size={44} still float={false} />
      <Text variant="label" className="text-center" numberOfLines={2}>
        {dot.name}
      </Text>
    </Pressable>
  );
}

function ScheduleRow({
  Icon,
  value,
  onPress,
  label,
  note,
}: {
  Icon: typeof Calendar;
  value: string;
  onPress: () => void;
  label: string;
  /** Secondary line, e.g. the timezone the time is read in. */
  note?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      className="min-h-14 flex-row items-center gap-3 rounded-control border border-border bg-card px-4"
    >
      <Icon size={20} strokeWidth={1.75} color="#0268fe" />
      <View className="flex-1">
        <Text variant="body">{value}</Text>
        {note ? <Text variant="secondary">{note}</Text> : null}
      </View>
      <ChevronRight size={20} strokeWidth={1.75} color="#78809b" />
    </Pressable>
  );
}

// _designs/task-new-screen.png
export default function NewTask() {
  const client = useQueryClient();
  const { data: dots = [], isPending } = useQuery(dotsQuery("active"));

  const [dotId, setDotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [cadence, setCadence] = useState<Cadence>(CADENCES[0]);
  const [time, setTime] = useState<string>(TIMES[1]);

  const [muted, foreground] = useCSSVariable([
    "--color-muted-foreground",
    "--color-foreground",
  ]);

  // Default to the first Dot once they load, without an effect: the chosen id
  // simply falls back until the user picks one.
  const selected = dots.find((dot) => dot.id === dotId) ?? dots[0];

  // The chips mirror what the chosen Dot can actually do, so switching Dot
  // visibly changes what the task is able to perform.
  const capabilities = TOOLS.filter((tool) => selected?.tools.includes(tool.key));

  const create = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      client.invalidateQueries({ queryKey: queryKeys.tasks });
      // A Dot gaining a task changes the Home "Scheduled" filter.
      client.invalidateQueries({ queryKey: queryKeys.allDots });
      router.replace({ pathname: "/task/[id]", params: { id: task.id } });
    },
    onError: (cause: Error) => toast.error(cause.message),
  });

  // Cycling keeps the pickers usable without a native picker sheet.
  const cycle = <T,>(list: readonly T[], current: T, set: (next: T) => void) => () =>
    set(list[(list.indexOf(current) + 1) % list.length]);

  const ready = Boolean(selected) && name.trim().length > 0 && prompt.trim().length > 0;

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
        contentContainerClassName="px-5 pb-8 gap-7"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text variant="title" className="text-center">
            Create a new task
          </Text>
          <Text variant="secondary" className="text-center">
            Set what you want to do, when to run it, and which Dot should handle it.
          </Text>
        </View>

        <View className="gap-3">
          <Text variant="section">Choose a Dot</Text>

          {isPending ? (
            <DotRowSkeleton />
          ) : dots.length === 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create a Dot first"
              onPress={() => router.replace("/dot/new")}
              className="items-center gap-2 rounded-card border border-border bg-card px-5 py-8"
            >
              <Text variant="cardTitle">No Dots yet</Text>
              <Text variant="secondary" className="text-center">
                A task needs a Dot to run it. Tap to create your first one.
              </Text>
            </Pressable>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
            >
              {dots.map((dot) => (
                <DotCard
                  key={dot.id}
                  dot={dot}
                  selected={dot.id === selected?.id}
                  onPress={() => setDotId(dot.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="gap-3">
          <Text variant="section">Name this task</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Morning AI Brief"
            placeholderTextColor={muted as string}
            selectionColor={foreground as string}
            accessibilityLabel="Task name"
            maxLength={60}
            className="min-h-14 rounded-control border border-border bg-card px-4 font-sans text-[16px] text-foreground"
          />
        </View>

        <View className="gap-3">
          <Text variant="section">What should this task do?</Text>
          <TextInput
            multiline
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Research important AI developer tools and send me a summary of the top 5 updates."
            placeholderTextColor={muted as string}
            selectionColor={foreground as string}
            accessibilityLabel="What should this task do?"
            textAlignVertical="top"
            className="min-h-28 rounded-control border border-border bg-card p-4 font-sans text-[16px] leading-6 text-foreground"
          />

          <View className="flex-row flex-wrap gap-2">
            {capabilities.map(({ key, label, Icon, color, tile }) => (
              <View
                key={key}
                className={cn("flex-row items-center gap-2 rounded-pill px-3 py-2", tile)}
              >
                <Icon size={16} strokeWidth={2} color={color} />
                <Text variant="label">{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text variant="section">Schedule</Text>
          <ScheduleRow
            Icon={Calendar}
            label="Repeats"
            value={cadence}
            onPress={cycle(CADENCES, cadence, setCadence)}
          />
          <ScheduleRow
            Icon={Clock}
            label="Time"
            value={time}
            note={TIMEZONES[0].label}
            onPress={cycle(TIMES, time, setTime)}
          />
        </View>

        <Button
          label="Create task"
          variant="primary"
          trailing={<ArrowRight size={20} strokeWidth={2} color="#ffffff" />}
          disabled={!ready || create.isPending}
          loading={create.isPending}
          onPress={() => {
            if (!selected) return;
            create.mutate({
              dotId: selected.id,
              name: name.trim(),
              prompt: prompt.trim(),
              cronExpression: toCron(cadence, time),
              timezone: TIMEZONES[0].value,
            });
          }}
        />
      </ScrollView>
    </Screen>
  );
}
