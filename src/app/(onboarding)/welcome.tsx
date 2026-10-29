import { Reveal } from "@/components/onboarding/reveal";
import { WelcomeHero } from "@/components/onboarding/welcome-hero";
import { Button } from "@/components/ui/button";
import { cn, Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Link, router } from "expo-router";
import {
  ArrowRight,
  MousePointer2,
  Search,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";

const CAPABILITIES: {
  key: string;
  Icon: LucideIcon;
  color: string;
  tile: string;
  lines: [string, string];
}[] = [
  { key: "research", Icon: Search, color: "#0268fe", tile: "bg-muted", lines: ["Research", "anything"] },
  { key: "browse", Icon: MousePointer2, color: "#111111", tile: "bg-muted", lines: ["Browse", "the web"] },
  { key: "act", Icon: Zap, color: "#fe7b0f", tile: "bg-warning-muted", lines: ["Take action", "for you"] },
];

export default function Welcome() {
  return (
    <Screen scroll contentClassName="px-5 pb-6">
      <View className="h-11 flex-row items-center justify-end">
        <Link href="/sign-up" asChild>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            className="min-h-11 justify-center px-2"
          >
            <Text variant="body" className="font-medium text-muted-foreground">
              Skip
            </Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex-1 items-center justify-center py-2">
        <Reveal delay={0}>
          <WelcomeHero />
        </Reveal>

        <Reveal delay={90} className="mt-2 items-center">
          <Text variant="display" className="text-center">
            Meet <Text variant="display" className="text-primary">Dot</Text>
          </Text>
        </Reveal>

        <Reveal delay={150} className="mt-3 px-2">
          <Text variant="body" className="text-center text-muted-foreground">
            AI agents that research, browse and get things done for you.
          </Text>
        </Reveal>

        <Reveal delay={210} className="mt-7 w-full flex-row gap-3">
          {CAPABILITIES.map(({ key, Icon, color, tile, lines }) => (
            <View key={key} className={cn("flex-1 items-start rounded-card p-4", tile)}>
              <Icon size={22} strokeWidth={1.75} color={color} />
              <Text variant="label" className="mt-3">
                {lines[0]}
              </Text>
              <Text variant="label">{lines[1]}</Text>
            </View>
          ))}
        </Reveal>
      </View>

      <Reveal delay={270} className="gap-4">
        <Button
          label="Get started"
          onPress={() => router.push("/sign-up")}
          trailing={<ArrowRight size={20} strokeWidth={1.75} color="#ffffff" />}
        />
        <Link href="/sign-in" asChild>
          <Pressable
            accessibilityRole="button"
            className="min-h-11 items-center justify-center"
          >
            <Text variant="secondary" className="font-medium">
              I already have an account
            </Text>
          </Pressable>
        </Link>
      </Reveal>
    </Screen>
  );
}
