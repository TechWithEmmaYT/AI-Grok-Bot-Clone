import { Text } from "@/components/ui/text";
import {
  CheckCheck,
  Copy,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { MarkdownBody } from "./markdown-body";
import { useCSSVariable } from "uniwind";

/** Right-aligned, primary fill, with send time and a delivered mark. */
export function UserMessage({ text, sentAt }: { text: string; sentAt: string }) {
  return (
    <View className="items-end">
      <View className="max-w-[88%] rounded-card rounded-br-md bg-primary px-4 py-3">
        <Text variant="body" className="text-primary-foreground">
          {text}
        </Text>
        <View className="mt-1 flex-row items-center justify-end gap-1">
          <Text variant="secondary" className="text-primary-foreground opacity-70">
            {sentAt}
          </Text>
          <CheckCheck size={14} strokeWidth={2} color="#ffffff" opacity={0.7} />
        </View>
      </View>
    </View>
  );
}

/** Left-aligned, quiet surface — the Dot's own voice. Body is Markdown. */
export function AssistantMessage({ text }: { text: string }) {
  return (
    <View className="items-start">
      <View className="max-w-[92%] rounded-card rounded-bl-md bg-muted px-4 py-3">
        <MarkdownBody value={text} />
      </View>
    </View>
  );
}

const ACTIONS = [
  { key: "up", Icon: ThumbsUp, label: "Good response" },
  { key: "down", Icon: ThumbsDown, label: "Bad response" },
  { key: "copy", Icon: Copy, label: "Copy" },
  { key: "more", Icon: MoreHorizontal, label: "More actions" },
] as const;

/** Feedback row under a completed answer. */
export function MessageActions() {
  return (
    <View className="flex-row items-center justify-center gap-6 py-1">
      {ACTIONS.map(({ key, Icon, label }) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={8}
          className="size-11 items-center justify-center"
        >
          <Icon size={20} strokeWidth={1.75} color="#78809b" />
        </Pressable>
      ))}
    </View>
  );
}

/**
 * A failed turn, on the Dot's side of the conversation so it reads as part of
 * the exchange rather than as app chrome. Tinted instead of filled: it has to
 * be unmistakable without looking like the Dot shouting.
 */
export function ErrorBubble({ message }: { message: string }) {
  const [destructive] = useCSSVariable(["--color-destructive"]);

  return (
    <View className="items-start">
      <View
        accessibilityRole="alert"
        className="max-w-[92%] flex-row items-start gap-2 rounded-card rounded-bl-md bg-destructive-muted px-4 py-3"
      >
        <TriangleAlert size={18} strokeWidth={2} color={destructive as string} />
        <Text variant="body" className="flex-1 text-destructive">
          {message}
        </Text>
      </View>
    </View>
  );
}
