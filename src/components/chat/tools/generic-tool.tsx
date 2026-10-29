import type { ToolKey } from "@/db/app-schema";
import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { TOOLS } from "@/lib/tools";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import type { StepStatus } from "../types";
import { ToolCard, type ToolBadge } from "./tool-card";

const BADGE: Record<StepStatus, ToolBadge> = {
  pending: { label: "Queued", tone: "idle" },
  running: { label: "Running", tone: "live" },
  done: { label: "Done", tone: "done" },
  error: { label: "Failed", tone: "error" },
};

type Props = {
  toolKey: ToolKey;
  title: string;
  detail?: string;
  status: StepStatus;
  /** Raw output, revealed on demand — most runs never need it opened. */
  output?: string;
};

/**
 * Default surface for any tool without a bespoke view: Treg searches, Gmail
 * sends, calendar writes. Anything new gets a usable card for free, and only
 * graduates to its own component when the generic one stops communicating.
 */
export function GenericTool({ toolKey, title, detail, status, output }: Props) {
  const [open, setOpen] = useState(false);
  const tool = TOOLS.find((t) => t.key === toolKey);
  if (!tool) return null;

  const { label, Icon, color, tile } = tool;

  return (
    <ToolCard
      icon={
        <View className={cn("size-9 items-center justify-center rounded-tile", tile)}>
          <Icon size={18} strokeWidth={1.75} color={color} />
        </View>
      }
      label={label}
      badge={BADGE[status]}
    >
      <View className="px-4 pb-4">
        <Text variant="cardTitle">{title}</Text>
        {detail ? (
          <Text variant="secondary" className="mt-0.5">
            {detail}
          </Text>
        ) : null}

        {output ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpen((v) => !v)}
              className="mt-3 min-h-11 flex-row items-center gap-1"
            >
              <Text variant="label" className="text-primary">
                {open ? "Hide output" : "Show output"}
              </Text>
              {open ? (
                <ChevronUp size={16} strokeWidth={2} color="#0268fe" />
              ) : (
                <ChevronDown size={16} strokeWidth={2} color="#0268fe" />
              )}
            </Pressable>

            {open ? (
              <View className="mt-1 rounded-card bg-muted p-3">
                <Text variant="secondary" className="text-foreground">
                  {output}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </ToolCard>
  );
}
