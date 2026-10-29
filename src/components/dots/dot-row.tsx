import base from "@/assets/dot.avatar.json";
import { Text } from "@/components/ui/text";
import type { Dot } from "@/lib/api";
import { ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { DotAvatar } from "./dot-avatar";
import { withLook } from "./dotLooks";

/** "Now", "4m", "3h", "2d" — compact enough for the trailing slot. */
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

type Props = { dot: Dot; onPress?: () => void };

export function DotRow({ dot, onPress }: Props) {
  const definition = useMemo(
    () => withLook(base, dot.shape, dot.color),
    [dot.shape, dot.color],
  );

  // Until chat lands in phase 4 there is no last message to preview, so the
  // Dot's own instructions stand in — the greeting when it has none.
  const preview = dot.instructions.trim() || "How can I help you today?";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dot.name}. ${preview}`}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-card border border-border bg-card p-4"
    >
      <DotAvatar definition={definition} size={48} still float={false} />

      <View className="flex-1">
        <Text variant="cardTitle" numberOfLines={1}>
          {dot.name}
        </Text>
        <Text variant="secondary" numberOfLines={1} className="mt-0.5">
          {preview}
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Text variant="secondary">{relativeTime(dot.updatedAt)}</Text>
        <ChevronRight size={18} strokeWidth={1.75} color="#78809b" />
      </View>
    </Pressable>
  );
}
