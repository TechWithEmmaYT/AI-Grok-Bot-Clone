import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { useDotDraft } from "@/components/dots/dot-draft";
import { withLook } from "@/components/dots/dotLooks";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Reveal } from "@/components/onboarding/reveal";
import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { createDot, queryKeys } from "@/lib/api";
import { toast } from "@/lib/sonner";
import { templateByKey } from "@/lib/templates";
import { TOOLS } from "@/lib/tools";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import { Switch, TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

export default function SetupDot() {
  const { draft, update, toggleTool } = useDotDraft();
  const template = templateByKey(draft.templateKey);
  const queryClient = useQueryClient();

  // Creation happens here rather than on the next screen: "<Name> is ready!"
  // should only appear once the Dot actually exists.
  const { mutate, isPending } = useMutation({
    mutationFn: createDot,
    onSuccess: () => {
      // Every filter's list is now stale; Home refetches on its next render.
      void queryClient.invalidateQueries({ queryKey: queryKeys.allDots });
      router.push("/dot/new/ready");
    },
    onError: (e: Error) => toast.error(e.message || "Could not create your Dot."),
  });

  const submit = () =>
    mutate({
      name: draft.name.trim(),
      shape: draft.shape,
      color: draft.color,
      instructions: draft.instructions.trim(),
      templateKey: draft.templateKey,
      tools: draft.tools,
    });

  const [primary, border, muted, foreground] = useCSSVariable([
    "--color-primary",
    "--color-border",
    "--color-muted-foreground",
    "--color-foreground",
  ]);

  const definition = useMemo(
    () => withLook(base, draft.shape, draft.color),
    [draft.shape, draft.color],
  );

  return (
    <OnboardingShell
      title="Set up your Dot"
      subtitle={
        template
          ? "Tell your Dot what it should do. We have pre-filled this from the template, you can edit it."
          : "Tell your Dot what it should do."
      }
      submitLabel="Create Dot"
      onSubmit={submit}
      loading={isPending}
      step={{ total: 2, current: 2 }}
    >
      {/* Identity recap, so the instructions below have a subject. */}
      <Reveal delay={120} className="mt-6">
        <View className="flex-row items-center gap-4 rounded-card bg-muted p-4">
          <DotAvatar definition={definition} size={48} still float={false} />
          <View className="flex-1">
            <Text variant="cardTitle">{draft.name || "Your Dot"}</Text>
            <Text variant="secondary" className="mt-0.5">
              {template?.description ?? "A custom Dot built from scratch."}
            </Text>
          </View>
        </View>
      </Reveal>

      <Reveal delay={180} className="mt-6">
        <Text variant="label" className="mb-2">
          Instructions
        </Text>
        <TextInput
          multiline
          textAlignVertical="top"
          value={draft.instructions}
          onChangeText={(instructions) => update({ instructions })}
          placeholder="Describe what this Dot should do, and how."
          placeholderTextColor={muted as string}
          selectionColor={foreground as string}
          accessibilityLabel="Instructions"
          className="min-h-36 rounded-control border border-border bg-card p-4 font-sans text-[16px] leading-6 text-foreground"
        />
      </Reveal>

      <Reveal delay={240} className="mt-6">
        <Text variant="label">Tools</Text>
        <Text variant="secondary" className="mb-3 mt-1">
          Choose which tools this Dot can use.
        </Text>

        <View className="gap-1">
          {TOOLS.map(({ key, label, description, Icon, color, tile }) => {
            const enabled = draft.tools.includes(key);
            return (
              <View key={key} className="min-h-14 flex-row items-center gap-3 py-2">
                <View
                  className={cn("size-11 items-center justify-center rounded-tile", tile)}
                >
                  <Icon size={20} strokeWidth={1.75} color={color} />
                </View>

                <View className="flex-1">
                  <Text variant="cardTitle">{label}</Text>
                  <Text variant="secondary" className="mt-0.5">
                    {description}
                  </Text>
                </View>

                <Switch
                  value={enabled}
                  onValueChange={() => toggleTool(key)}
                  accessibilityLabel={label}
                  trackColor={{ true: primary as string, false: border as string }}
                  thumbColor="#ffffff"
                />
              </View>
            );
          })}
        </View>
      </Reveal>
    </OnboardingShell>
  );
}
