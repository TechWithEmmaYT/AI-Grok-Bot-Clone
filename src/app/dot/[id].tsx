import base from "@/assets/dot.avatar.json";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ErrorBubble } from "@/components/chat/message-bubble";
import { MessageRow } from "@/components/chat/message-list";
import { ThinkingRow } from "@/components/chat/thinking-row";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { ConversationSkeleton } from "@/components/ui/skeleton";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { loadDotTranscript, useDotChatTransport } from "@/lib/chat-transport";
import { useChat } from "@ai-sdk/react";
import { useLoadTranscript } from "@trigger.dev/sdk/chat/react";
import type { TriggerChatTransport } from "@trigger.dev/sdk/chat";
import type { UIMessage } from "ai";
import { useLocalSearchParams } from "expo-router";
import { Square } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

/** Treat "within a screenful of the bottom" as following the stream. */
const NEAR_BOTTOM = 120;

/** How much of the live reasoning to keep on screen, in characters. */
const REASONING_TAIL = 240;

export default function DotChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id ?? "";

  const transport = useDotChatTransport(chatId);
  // History is read before the chat connects, and seeds the transport's resume
  // cursor so the live subscription opens past it instead of replaying it.
  const { messages: history, isLoading } = useLoadTranscript(chatId, loadDotTranscript, {
    transport,
  });

  const definition = useMemo(() => withLook(base, "blob", "blue"), []);

  if (isLoading) {
    return (
      <Screen edges={["top"]}>
        <ChatHeader definition={definition} loading />
        <View className="flex-1">
          <View className="flex-1 px-4 py-4">
            <ConversationSkeleton />
          </View>
          <ChatComposer value="" onChangeText={() => {}} disabled />
        </View>
      </Screen>
    );
  }

  // Keyed so a different dot mounts a fresh conversation rather than inheriting
  // the previous one's messages — useChat only reads `messages` on mount.
  return (
    <Conversation
      key={chatId}
      chatId={chatId}
      transport={transport}
      history={history}
      definition={definition}
    />
  );
}

function Conversation({
  chatId,
  transport,
  history,
  definition,
}: {
  chatId: string;
  transport: TriggerChatTransport;
  history: UIMessage[];
  definition: Parameters<typeof DotAvatar>[0]["definition"];
}) {
  const { messages, sendMessage, stop, status, error } = useChat({
    // The transport uses this as the chat id, and our server routes check it
    // against the caller's dots. Omit it and the AI SDK invents a random id,
    // the ownership check fails and no run is ever triggered.
    id: chatId,
    transport,
    messages: history,
    // Surfaced in the bubble below, and mirrored to the Metro terminal so a
    // failed turn is diagnosable without reading it off the phone screen.
    onError: (cause) => {
      console.error("[dot-chat] turn failed", { chatId, cause });
    },
  });

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  // Only auto-scroll when the user is already following along — yanking the
  // view down while they are reading earlier messages is worse than no scroll.
  const following = useRef(true);

  const streaming = status === "streaming" || status === "submitted";

  // The row stays up from the moment the message is sent until the assistant's
  // first token, so it is replaced by the reply rather than sitting above it.
  const last = messages[messages.length - 1];
  const replyStarted =
    last?.role === "assistant" &&
    last.parts.some((part) => part.type === "text" && "text" in part && part.text.length > 0);
  const waiting = streaming && !replyStarted;

  // The model's thinking for the turn in flight. Only the tail is shown: the
  // row is a status line, not a transcript, and reasoning can run long.
  const reasoning = waiting
    ? last?.parts
        .filter((part) => part.type === "reasoning")
        .map((part) => ("text" in part ? part.text : ""))
        .join("")
        .trim()
        .slice(-REASONING_TAIL) || undefined
    : undefined;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distance = contentSize.height - layoutMeasurement.height - contentOffset.y;
    following.current = distance < NEAR_BOTTOM;
  };

  const send = (text: string) => {
    void sendMessage({ text });
    setDraft("");
    following.current = true;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <Screen edges={["top"]}>
      <ChatHeader
        definition={definition}
        subtitle={streaming ? "Working on it…" : "Your personal assistant"}
      />

      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-4 py-4 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={64}
          onContentSizeChange={() => {
            if (following.current) scrollRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} sentAt="" />
          ))}

          {waiting ? <ThinkingRow reasoning={reasoning} /> : null}

          {error ? <ErrorBubble message={error.message} /> : null}
        </ScrollView>

        {streaming ? (
          <View className="items-center pb-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop generating"
              onPress={stop}
              className="min-h-11 flex-row items-center gap-2 rounded-pill border border-border bg-card px-4"
            >
              <Square size={14} strokeWidth={2} color="#111111" fill="#111111" />
              <Text variant="label">Stop</Text>
            </Pressable>
          </View>
        ) : null}

        <ChatComposer value={draft} onChangeText={setDraft} onSend={send} />
      </View>
    </Screen>
  );
}
