import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Check, X } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { Step } from "./types";

/** Rotating arc for a running step. Static ring under Reduce Motion. */
function Spinner() {
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    spin.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduceMotion, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Animated.View
      style={style}
      className="size-6 rounded-pill border-2 border-border border-t-primary"
    />
  );
}

function StatusMark({ status }: { status: Step["status"] }) {
  if (status === "done") {
    return (
      <View className="size-6 items-center justify-center rounded-pill bg-success">
        <Check size={14} strokeWidth={3} color="#ffffff" />
      </View>
    );
  }
  if (status === "error") {
    return (
      <View className="size-6 items-center justify-center rounded-pill bg-destructive">
        <X size={14} strokeWidth={3} color="#ffffff" />
      </View>
    );
  }
  if (status === "running") return <Spinner />;
  return <View className="size-6 rounded-pill bg-muted" />;
}

type Props = {
  step: Step;
  icon?: React.ReactNode;
  /** Draws the connector down to the next row. */
  connected?: boolean;
};

export function StepRow({ step, icon, connected = false }: Props) {
  const pending = step.status === "pending";

  return (
    <View className="flex-row gap-3">
      {/* Leading tile + connector */}
      <View className="items-center">
        <View
          className={cn(
            "size-11 items-center justify-center rounded-tile",
            step.tint ?? "bg-muted",
            pending && "opacity-50",
          )}
        >
          {icon}
        </View>
        {connected ? <View className="my-1 w-px flex-1 bg-border" /> : null}
      </View>

      <View className={cn("flex-1 pb-5", pending && "opacity-50")}>
        <Text variant="cardTitle">{step.title}</Text>
        {step.detail ? (
          <Text variant="secondary" className="mt-0.5">
            {step.detail}
          </Text>
        ) : null}
      </View>

      <View className="pt-2.5">
        <StatusMark status={step.status} />
      </View>
    </View>
  );
}
