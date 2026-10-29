import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import type { RunStep } from "@/lib/api";
import { clockTime } from "@/lib/format";
import { Check, FileText, Globe, Play, Search, X, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";

/** Each step kind gets its own glyph and tint, matching the tool palette. */
const ICONS: Record<RunStep["icon"], { Icon: LucideIcon; color: string; tile: string }> = {
  start: { Icon: Play, color: "#00c755", tile: "bg-success-muted" },
  search: { Icon: Search, color: "#0268fe", tile: "bg-secondary" },
  browse: { Icon: Globe, color: "#a246f9", tile: "bg-[#f3e9fe]" },
  write: { Icon: FileText, color: "#fe7b0f", tile: "bg-warning-muted" },
  done: { Icon: Check, color: "#ffffff", tile: "bg-success" },
  failed: { Icon: X, color: "#ffffff", tile: "bg-destructive" },
};

/**
 * What the run actually did, in order, with the time each step began.
 *
 * Times are tabular so the right-hand column stays aligned, and the connector
 * is drawn behind the tiles rather than between them so it survives rows of
 * different heights when the text wraps.
 */
export function RunTimeline({ steps, error }: { steps: RunStep[]; error?: string }) {
  return (
    <View>
      {steps.map((step, index) => {
        const { Icon, color, tile } = ICONS[step.icon];
        const last = index === steps.length - 1;

        return (
          <View key={step.id} className="flex-row gap-3">
            <View className="items-center">
              <View className={cn("size-9 items-center justify-center rounded-pill", tile)}>
                <Icon
                  size={18}
                  strokeWidth={2}
                  color={color}
                  fill={step.icon === "start" ? color : "none"}
                />
              </View>
              {!last ? <View className="w-px flex-1 bg-border" /> : null}
            </View>

            <View className={cn("flex-1 flex-row gap-3", !last && "pb-5")}>
              <View className="flex-1">
                <Text variant="cardTitle">{step.title}</Text>
                {step.detail ? <Text variant="secondary">{step.detail}</Text> : null}
                {last && error ? (
                  <Text variant="secondary" className="mt-1 text-destructive">
                    {error}
                  </Text>
                ) : null}
              </View>
              {/* Tabular figures via the RN style prop rather than a utility:
                  the design calls for aligned times and this is the one RN
                  honours on both platforms. */}
              <Text variant="secondary" style={{ fontVariant: ["tabular-nums"] }}>
                {clockTime(step.at)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
