import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { useDotDraft } from "@/components/dots/dot-draft";
import { withLook } from "@/components/dots/dotLooks";
import { Reveal } from "@/components/onboarding/reveal";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { toolLabel } from "@/lib/tools";
import { Redirect, router } from "expo-router";
import { ArrowRight, Check, X } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

function CheckRow({ title, detail }: { title: string; detail?: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 size-6 items-center justify-center rounded-pill bg-success">
        <Check size={14} strokeWidth={3} color="#ffffff" />
      </View>
      <View className="flex-1">
        <Text variant="body" className="font-medium">
          {title}
        </Text>
        {detail ? (
          <Text variant="secondary" className="mt-0.5">
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function DotReady() {
  const { draft, reset } = useDotDraft();

  const definition = useMemo(
    () => withLook(base, draft.shape, draft.color),
    [draft.shape, draft.color],
  );

  // Reached directly with nothing in the draft to celebrate.
  if (!draft.name) return <Redirect href="/dot/new" />;

  const tools = draft.tools.map(toolLabel).join(", ");

  // Chat arrives in phase 4, so every exit currently lands on Home. Clearing
  // the draft matters: the provider outlives this screen within the group.
  const finish = () => {
    reset();
    router.replace("/");
  };

  return (
    <Screen scroll contentClassName="px-5 pb-6">
      <View className="h-11 flex-row items-center justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={finish}
          className="size-11 items-center justify-center rounded-pill border border-border bg-card"
        >
          <X size={20} strokeWidth={2} color="#111111" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center py-4">
        <Reveal delay={0}>
          <DotAvatar definition={definition} animation="happy" size={200} fps={60} />
        </Reveal>

        <Reveal delay={120} className="mt-4">
          <Text variant="title" className="text-center">
            {draft.name} is ready!
          </Text>
        </Reveal>

        <Reveal delay={180} className="mt-3 px-2">
          <Text variant="body" className="text-center text-muted-foreground">
            Your new Dot can now get to work. You can change any of this later.
          </Text>
        </Reveal>

        <Reveal delay={240} className="mt-7 w-full gap-4 rounded-card border border-border bg-card p-5">
          <CheckRow title="Character and name set" />
          <CheckRow title="Instructions configured" />
          <CheckRow
            title="Tools enabled"
            detail={tools || "None — you can add some later"}
          />
          <CheckRow title="Ready to chat" />
        </Reveal>
      </View>

      <Reveal delay={300} className="gap-3">
        <Button
          label="Start chatting"
          onPress={finish}
          trailing={<ArrowRight size={20} strokeWidth={1.75} color="#ffffff" />}
        />
        <Button label="View in Home" variant="outline" onPress={finish} />
      </Reveal>
    </Screen>
  );
}
