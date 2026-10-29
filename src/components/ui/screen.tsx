import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export type ScreenEdge = "top" | "bottom";

type Props = {
  children: ReactNode;
  /** Safe-area edges this screen owns. Omit any the navigator already handles. */
  edges?: readonly ScreenEdge[];
  /** Scrolls when content exceeds the viewport; still fills it when it does not. */
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
};

/**
 * Full-height semantic root. Owns the background and the safe-area edges it is
 * given — never navigation or business state.
 *
 * Insets are applied with useSafeAreaInsets on a core View rather than with
 * SafeAreaView: Uniwind only styles React Native core components, so a
 * className on the third-party SafeAreaView is silently dropped and the
 * layout collapses.
 */
export function Screen({
  children,
  edges = ["top", "bottom"],
  scroll = false,
  className,
  contentClassName,
}: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
  };

  if (!scroll) {
    return (
      <View className={cn("flex-1 bg-background", className)} style={padding}>
        <View className={cn("flex-1", contentClassName)}>{children}</View>
      </View>
    );
  }

  return (
    <View className={cn("flex-1 bg-background", className)} style={padding}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className={cn("flex-1", contentClassName)}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
