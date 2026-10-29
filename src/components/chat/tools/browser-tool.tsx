import { Text } from "@/components/ui/text";
import { ChevronDown, ChevronUp, Globe, Maximize2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { StepRow } from "../step-row";
import type { Step } from "../types";
import { ToolCard } from "./tool-card";

type Props = {
  /** Shown in the viewport chrome so the page being driven is identifiable. */
  url: string;
  live: boolean;
  steps: Step[];
  /** Rendered once the run finishes. */
  summary?: string;
  onOpen?: () => void;
};

/**
 * Browserbase / Stagehand surface — single-dot-screen-4 plus the controls that
 * design implies but does not show: collapse the preview, open it full-screen,
 * and read the result once the run lands.
 */
export function BrowserTool({ url, live, steps, summary, onOpen }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <ToolCard
      icon={<Globe size={22} strokeWidth={1.75} color="#a246f9" />}
      label="Browser"
      badge={live ? { label: "Live", tone: "live" } : { label: "Finished", tone: "done" }}
    >
      {open ? (
        <View className="mx-4 overflow-hidden rounded-card bg-canvas">
          {/* Viewport chrome: the address bar makes the target legible even
              before any frame has painted. */}
          <View className="flex-row items-center gap-2 border-b border-white/10 px-3 py-2">
            <View className="size-2 rounded-pill bg-white/30" />
            <Text variant="secondary" numberOfLines={1} className="flex-1 text-canvas-foreground opacity-70">
              {url}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open full screen"
              hitSlop={8}
              onPress={onOpen}
              className="size-8 items-center justify-center"
            >
              <Maximize2 size={16} strokeWidth={1.75} color="#f4f6fa" />
            </Pressable>
          </View>

          {/* Live frames stream in here. Until then the surface stays dark so
              the hand-off from placeholder to first frame is not a flash. */}
          <View className="h-52 items-center justify-center">
            <Text variant="secondary" className="text-canvas-foreground opacity-50">
              {live ? "Streaming the page…" : "Session ended"}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="px-4 pt-4">
        {steps.map((step, i) => (
          <StepRow key={step.id} step={step} connected={i < steps.length - 1} />
        ))}
      </View>

      {summary ? (
        <View className="mx-4 mb-4 rounded-card bg-muted p-3">
          <Text variant="label" className="mb-1">
            Result
          </Text>
          <Text variant="body">{summary}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        className="min-h-12 flex-row items-center justify-center gap-2 border-t border-border"
      >
        <Text variant="label" className="text-muted-foreground">
          {open ? "Hide preview" : "Show preview"}
        </Text>
        {open ? (
          <ChevronUp size={16} strokeWidth={2} color="#78809b" />
        ) : (
          <ChevronDown size={16} strokeWidth={2} color="#78809b" />
        )}
      </Pressable>
    </ToolCard>
  );
}
