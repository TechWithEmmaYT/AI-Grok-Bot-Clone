import { DotAvatar } from "@/components/dots/dot-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { ChevronLeft, MoreHorizontal } from "lucide-react-native";
import { Pressable, View } from "react-native";

type Props = {
  /** The avatar definition, already given its look. */
  definition: Parameters<typeof DotAvatar>[0]["definition"];
  name?: string;
  subtitle?: string;
  /** Renders placeholders for the name and subtitle, keeping the chrome usable. */
  loading?: boolean;
};

/**
 * Rendered in both the loading and loaded states, so opening a Dot shows its
 * chrome immediately — Back stays usable while the conversation is still being
 * fetched, instead of the screen appearing to hang.
 */
export function ChatHeader({ definition, name = "Dot", subtitle, loading }: Props) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        className="-ml-2 size-11 items-center justify-center"
      >
        <ChevronLeft size={24} strokeWidth={1.75} color="#111111" />
      </Pressable>

      <DotAvatar definition={definition} size={38} still float={false} />

      <View className="flex-1 gap-1">
        {loading ? (
          <>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-36" />
          </>
        ) : (
          <>
            <Text variant="cardTitle">{name}</Text>
            <Text variant="secondary">{subtitle}</Text>
          </>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dot options"
        hitSlop={12}
        disabled={loading}
        className="size-11 items-center justify-center"
      >
        <MoreHorizontal size={22} strokeWidth={1.75} color="#111111" />
      </Pressable>
    </View>
  );
}
