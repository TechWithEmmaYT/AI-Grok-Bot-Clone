import { Text } from "@/components/ui/text";
import { ChevronRight, ExternalLink } from "lucide-react-native";
import { Pressable, View } from "react-native";
import type { ResultItem } from "./types";

type Props = {
  title: string;
  subtitle: string;
  items: ResultItem[];
  sourceCount: number;
};

/** Ranked answer card from single-dot-screen-3. */
export function ResultCard({ title, subtitle, items, sourceCount }: Props) {
  return (
    <View className="rounded-card bg-muted p-4">
      <Text variant="title">{title}</Text>
      <Text variant="body" className="mt-1 text-muted-foreground">
        {subtitle}
      </Text>

      <View className="mt-4 gap-2">
        {items.map((item, i) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}. ${item.title}. ${item.description}`}
            className="flex-row items-center gap-3 rounded-card bg-card p-3"
          >
            <View className="size-6 items-center justify-center rounded-pill bg-secondary">
              <Text variant="label" className="text-secondary-foreground">
                {i + 1}
              </Text>
            </View>

            {/* Real product logos are third-party and fetched at runtime; the
                mark stands in so the row keeps its shape either way. */}
            <View className="size-11 items-center justify-center rounded-tile bg-foreground">
              <Text variant="label" className="text-background">
                {item.initials}
              </Text>
            </View>

            <View className="flex-1">
              <Text variant="cardTitle">{item.title}</Text>
              <Text variant="secondary" className="mt-0.5">
                {item.description}
              </Text>
            </View>

            <ChevronRight size={18} strokeWidth={1.75} color="#78809b" />
          </Pressable>
        ))}
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-1 items-center justify-center rounded-pill bg-primary px-4"
        >
          <Text variant="cardTitle" className="text-primary-foreground">
            View full comparison
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${sourceCount} sources`}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-pill border border-border bg-card px-4"
        >
          <ExternalLink size={18} strokeWidth={1.75} color="#111111" />
          <Text variant="cardTitle">View sources</Text>
        </Pressable>
      </View>
    </View>
  );
}
