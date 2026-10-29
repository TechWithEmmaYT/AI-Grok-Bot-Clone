import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { DotRow } from "@/components/dots/dot-row";
import { withLook } from "@/components/dots/dotLooks";
import { cn, Screen } from "@/components/ui/screen";
import { DotRowSkeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { dotsQuery, type DotFilter } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const FILTERS: { key: DotFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "archived", label: "Archived" },
];

function CircleButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="size-11 items-center justify-center rounded-pill border border-border bg-card"
    >
      {children}
    </Pressable>
  );
}

/** Mascot trio from the promo card and the empty state. */
function DotTrio() {
  const orange = useMemo(() => withLook(base, "blob", "orange"), []);
  const green = useMemo(() => withLook(base, "cloud", "green"), []);

  return (
    <View className="h-32 flex-row items-end justify-center">
      <DotAvatar definition={orange} size={64} still float={false} />
      <DotAvatar definition={base} animation="idle" size={104} fps={60} />
      <DotAvatar definition={green} size={70} still float={false} />
    </View>
  );
}

export default function Home() {
  const [filter, setFilter] = useState<DotFilter>("all");
  const { data: dots = [], isPending, error } = useQuery(dotsQuery(filter));

  const showEmpty = !isPending && !error && dots.length === 0;

  return (
    <Screen edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Text variant="display">Dots</Text>
        <View className="flex-row gap-3">
          <CircleButton label="Search Dots">
            <Search size={20} strokeWidth={1.75} color="#111111" />
          </CircleButton>
          <CircleButton label="Create a new Dot" onPress={() => router.push("/dot/new")}>
            <Plus size={22} strokeWidth={1.75} color="#111111" />
          </CircleButton>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 py-3"
        className="max-h-16 grow-0"
      >
        {FILTERS.map(({ key, label }) => {
          const selected = key === filter;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFilter(key)}
              className={cn(
                "h-10 justify-center rounded-pill px-4",
                selected ? "bg-secondary" : "bg-muted",
              )}
            >
              <Text
                variant="label"
                className={selected ? "text-secondary-foreground" : "text-muted-foreground"}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerClassName="px-5 pb-8 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <>
            <DotRowSkeleton />
            <DotRowSkeleton />
            <DotRowSkeleton />
          </>
        ) : error ? (
          <View className="items-center gap-2 rounded-card border border-border bg-card p-6">
            <Text variant="cardTitle">Could not load your Dots</Text>
            <Text variant="secondary" className="text-center">
              {error.message}
            </Text>
          </View>
        ) : (
          dots.map((dot) => (
            <DotRow
              key={dot.id}
              dot={dot}
              onPress={() =>
                router.push({ pathname: "/dot/[id]", params: { id: dot.id } })
              }
            />
          ))
        )}

        {/* Promo when Dots exist, full empty state when none do. */}
        {!isPending && !error ? (
          <View className="mt-6 items-center gap-3 px-2">
            <DotTrio />
            <Text variant="title" className="text-center">
              {showEmpty ? "Create your first Dot" : "Create more Dots"}
            </Text>
            <Text variant="body" className="text-center text-muted-foreground">
              Build specialized agents for research, inbox, coding and more.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/dot/new")}
              className="mt-2 min-h-14 w-full flex-row items-center justify-center gap-2 rounded-pill bg-secondary px-5"
            >
              <Plus size={20} strokeWidth={2} color="#0268fe" />
              <Text variant="cardTitle" className="text-secondary-foreground">
                Create a new Dot
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
