import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { Text } from "@/components/ui/text";
import type { Task } from "@/lib/api";
import { describeCron } from "@/lib/schedule";
import { useMemo } from "react";
import { Pressable, Switch, View } from "react-native";
import { useCSSVariable } from "uniwind";

type Props = {
  task: Task;
  onPress?: () => void;
  onToggle?: (enabled: boolean) => void;
};

/** One row in the Tasks list: who runs it, what it is, and when. */
export function TaskRow({ task, onPress, onToggle }: Props) {
  const definition = useMemo(
    () => withLook(base, task.shape, task.color),
    [task.shape, task.color],
  );
  const [primary, border] = useCSSVariable(["--color-primary", "--color-border"]);

  // The row shows a sentence; the cron is what is actually stored.
  const cadence = describeCron(task.cronExpression);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${task.name}, ${task.dotName}, ${cadence}`}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-card border border-border bg-card px-3 py-2.5"
    >
      <DotAvatar
        definition={definition}
        size={44}
        still
        float={false}
        label={`${task.dotName}, ${task.color}`}
      />

      <View className="flex-1">
        <Text variant="cardTitle">{task.name}</Text>
        <Text variant="secondary">{task.dotName}</Text>
        <Text variant="secondary">{cadence}</Text>
      </View>

      <Switch
        value={task.enabled}
        onValueChange={onToggle}
        accessibilityLabel={`${task.name} enabled`}
        trackColor={{ true: primary as string, false: border as string }}
        thumbColor="#ffffff"
      />
    </Pressable>
  );
}
