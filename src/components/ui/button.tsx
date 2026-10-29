import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { cn } from "./screen";
import { Text } from "./text";

const CONTAINER = {
  primary: "bg-foreground",
  secondary: "bg-secondary",
  outline: "bg-card border border-border",
  ghost: "bg-transparent",
} as const;

const LABEL = {
  primary: "text-background",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-muted-foreground",
} as const;

const SPINNER = {
  primary: "#ffffff",
  secondary: "#0268fe",
  outline: "#111111",
  ghost: "#78809b",
} as const;

export type ButtonVariant = keyof typeof CONTAINER;

type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: "lg" | "md";
  loading?: boolean;
  /** Rendered after the label, e.g. a trailing arrow. */
  trailing?: ReactNode;
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled,
  trailing,
  className,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : 1 - pressed.value * 0.02 }],
    opacity: 1 - pressed.value * 0.08,
  }));

  const isBlocked = Boolean(disabled) || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      onPressIn={(e) => {
        pressed.value = withTiming(1, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withTiming(0, { duration: 120 });
        onPressOut?.(e);
      }}
      className="w-full"
      {...rest}
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          "w-full flex-row items-center justify-center rounded-pill px-5",
          size === "lg" ? "min-h-14 py-4" : "min-h-12 py-3",
          CONTAINER[variant],
          isBlocked && "opacity-50",
          className,
        )}
      >
        {loading ? (
          <ActivityIndicator color={SPINNER[variant]} />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            <Text className={cn("font-bold text-[17px] leading-[22px]", LABEL[variant])}>
              {label}
            </Text>
            {trailing}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}
