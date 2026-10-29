import { useEffect } from "react";
import { View, type ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "./screen";

type Props = ViewProps & { className?: string };

/**
 * Placeholder block for content that is loading. The pulse runs on the UI
 * thread and settles to a static block under Reduce Motion, so the layout
 * still communicates "loading" without movement.
 */
export function Skeleton({ className, ...rest }: Props) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(0.45, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
      className={cn("rounded-control bg-muted", className)}
      {...rest}
    />
  );
}

/** Matches the shape of one Dot row so the list does not jump when data lands. */
export function DotRowSkeleton() {
  return (
    <View className="flex-row items-center gap-4 rounded-card border border-border bg-card p-4">
      <Skeleton className="size-12 rounded-pill" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </View>
    </View>
  );
}

/**
 * Stand-in for a conversation that has not loaded yet. Alternates sides and
 * widths so it reads as a thread rather than a stack of identical bars.
 */
export function ConversationSkeleton() {
  return (
    <View className="gap-4">
      <View className="items-end">
        <Skeleton className="h-12 w-48 rounded-card rounded-br-md" />
      </View>
      <View className="items-start">
        <Skeleton className="h-24 w-72 rounded-card rounded-bl-md" />
      </View>
      <View className="items-end">
        <Skeleton className="h-10 w-36 rounded-card rounded-br-md" />
      </View>
      <View className="items-start">
        <Skeleton className="h-20 w-64 rounded-card rounded-bl-md" />
      </View>
    </View>
  );
}
