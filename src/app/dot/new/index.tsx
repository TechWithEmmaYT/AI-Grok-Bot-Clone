import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { useDotDraft } from "@/components/dots/dot-draft";
import { withLook } from "@/components/dots/dotLooks";
import { Reveal } from "@/components/onboarding/reveal";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { TEMPLATES, type Template } from "@/lib/templates";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

function ChoiceCard({
  icon,
  tile,
  title,
  body,
  onPress,
}: {
  icon: React.ReactNode;
  tile: string;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      onPress={onPress}
      className="flex-1 rounded-card border border-border bg-card p-4"
    >
      <View className={`size-11 items-center justify-center rounded-tile ${tile}`}>
        {icon}
      </View>
      <Text variant="cardTitle" className="mt-4">
        {title}
      </Text>
      <Text variant="secondary" className="mt-1">
        {body}
      </Text>
    </Pressable>
  );
}

function TemplateRow({ template, onPress }: { template: Template; onPress: () => void }) {
  const definition = useMemo(
    () => withLook(base, template.shape, template.color),
    [template.shape, template.color],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${template.name}. ${template.description}`}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-card border border-border bg-card p-4"
    >
      <DotAvatar definition={definition} size={44} still float={false} />
      <View className="flex-1">
        <Text variant="cardTitle">{template.name}</Text>
        <Text variant="secondary" className="mt-0.5">
          {template.description}
        </Text>
      </View>
      <ChevronRight size={18} strokeWidth={1.75} color="#78809b" />
    </Pressable>
  );
}

export default function NewDot() {
  const { startFromScratch, startFromTemplate } = useDotDraft();

  return (
    <Screen scroll contentClassName="px-5 pb-8">
      <View className="h-11 justify-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          className="-ml-2 size-11 items-center justify-center"
        >
          <ChevronLeft size={24} strokeWidth={1.75} color="#111111" />
        </Pressable>
      </View>

      <Reveal delay={0} className="mt-4">
        <Text variant="title">Create a new Dot</Text>
        <Text variant="body" className="mt-2 text-muted-foreground">
          Start from scratch or use a ready-made template.
        </Text>
      </Reveal>

      <Reveal delay={80} className="mt-6 flex-row gap-3">
        <ChoiceCard
          tile="bg-secondary"
          icon={<Plus size={22} strokeWidth={2} color="#0268fe" />}
          title="Create from scratch"
          body="Build a custom Dot with your own instructions."
          onPress={() => {
            startFromScratch();
            router.push("/dot/new/customize");
          }}
        />
        <ChoiceCard
          tile="bg-warning-muted"
          icon={<Sparkles size={22} strokeWidth={2} color="#fe7b0f" />}
          title="Use a template"
          body="Get started quickly with a ready-made Dot."
          onPress={() => {
            startFromTemplate(TEMPLATES[0]);
            router.push("/dot/new/customize");
          }}
        />
      </Reveal>

      <Reveal delay={140} className="mt-8">
        <Text variant="section">Popular templates</Text>
      </Reveal>

      <Reveal delay={200} className="mt-4 gap-3">
        <ScrollView scrollEnabled={false} contentContainerClassName="gap-3">
          {TEMPLATES.map((template) => (
            <TemplateRow
              key={template.key}
              template={template}
              onPress={() => {
                startFromTemplate(template);
                router.push("/dot/new/customize");
              }}
            />
          ))}
        </ScrollView>
      </Reveal>
    </Screen>
  );
}
