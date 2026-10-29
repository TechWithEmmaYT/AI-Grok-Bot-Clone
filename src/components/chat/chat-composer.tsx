import { cn } from "@/components/ui/screen";
import { ArrowUp, Mic } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

type Props = {
  /** Controlled so quick actions can prefill it without a remount. */
  value: string;
  onChangeText: (next: string) => void;
  onSend?: (text: string) => void;
  placeholder?: string;
  /** Blocks input entirely, e.g. while the conversation is still loading. */
  disabled?: boolean;
};

/** Pinned input from every chat screen: dictate and send, on one row. */
export function ChatComposer({
  value: text,
  onChangeText: setText,
  onSend,
  placeholder = "Ask me anything...",
  disabled = false,
}: Props) {
  const insets = useSafeAreaInsets();

  // Reanimated ships with the Expo SDK, so this tracks the keyboard without a
  // native module and without a development build. The height is a shared
  // value driven on the UI thread, so the bar follows the keyboard frame by
  // frame instead of jumping after it has settled.
  const keyboard = useAnimatedKeyboard();

  // Closed: clear the home indicator or nav bar, with a floor because many
  // Android devices report a bottom inset of 0. Open: the keyboard already
  // covers that region, so its height replaces the inset rather than adding
  // to it.
  const restingSpace = Math.max(insets.bottom, 20);
  const spacing = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, restingSpace),
  }));

  const [muted, foreground] = useCSSVariable([
    "--color-muted-foreground",
    "--color-foreground",
  ]);

  const canSend = !disabled && text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend?.(text.trim());
    setText("");
  };

  return (
    // Growing this view shrinks the message list above it, because the chat
    // screen is a flex column with the list on flex-1 — so the newest message
    // stays visible instead of sliding under the bar.
    <Animated.View
      className="border-t border-border bg-background px-4 pt-3"
      style={spacing}
    >
      <View className="flex-row items-end gap-2 rounded-card border border-border bg-card p-2.5">
        <TextInput
          multiline
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={muted as string}
          selectionColor={foreground as string}
          accessibilityLabel="Message"
          editable={!disabled}
          // Starts one line tall and grows to about four before scrolling.
          className="max-h-24 min-h-10 flex-1 px-2 py-2 font-sans text-[16px] leading-5 text-foreground"
        />

        {/* Visually 40pt so the bar stays short; hitSlop keeps the real touch
            target above the 44pt minimum. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dictate"
          accessibilityState={{ disabled }}
          disabled={disabled}
          hitSlop={8}
          className={cn(
            "size-10 items-center justify-center rounded-pill bg-muted",
            disabled && "opacity-40",
          )}
        >
          <Mic size={19} strokeWidth={1.75} color="#111111" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={send}
          hitSlop={8}
          className={cn(
            "size-10 items-center justify-center rounded-pill bg-primary",
            !canSend && "opacity-40",
          )}
        >
          <ArrowUp size={21} strokeWidth={2.25} color="#ffffff" />
        </Pressable>
      </View>
    </Animated.View>
  );
}
