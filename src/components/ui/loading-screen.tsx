import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "./text";

type Props = { label?: string };

/**
 * Full-bleed branded wait state, used while the session resolves. On primary
 * so the hand-off from the splash reads as one continuous moment rather than
 * a white flash between two screens.
 */
export function LoadingScreen({ label }: Props) {
  // White Dot on the blue field — the usual blue body would disappear into it.
  const mark = useMemo(() => withLook(base, "blob", "white"), []);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? "Loading"}
      className="flex-1 items-center justify-center gap-6 bg-primary"
    >
      <DotAvatar definition={mark} animation="idle" size={132} fps={60} />

      {label ? (
        <Text variant="body" className="text-primary-foreground opacity-90">
          {label}
        </Text>
      ) : (
        <ActivityIndicator color="#ffffff" />
      )}
    </View>
  );
}
