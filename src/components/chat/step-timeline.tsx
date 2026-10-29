import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { Text } from "@/components/ui/text";
import type { DotColor, DotShape } from "@/components/dots/dotLooks";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { StepRow } from "./step-row";
import type { Step } from "./types";

type Props = {
  label: string;
  steps: Step[];
  shape: DotShape;
  color: DotColor;
  collapsible?: boolean;
  /** Per-step leading glyphs, keyed by step id. */
  icons?: Record<string, React.ReactNode>;
};

/** "Dot is working on it…" — the live run panel from single-dot-screen-2. */
export function StepTimeline({
  label,
  steps,
  shape,
  color,
  collapsible = true,
  icons,
}: Props) {
  const [open, setOpen] = useState(true);
  const definition = useMemo(() => withLook(base, shape, color), [shape, color]);

  return (
    <View className="rounded-card border border-border bg-card p-4">
      <Pressable
        accessibilityRole={collapsible ? "button" : undefined}
        accessibilityState={collapsible ? { expanded: open } : undefined}
        accessibilityLabel={collapsible ? `${label}. ${open ? "Collapse" : "Expand"}` : undefined}
        disabled={!collapsible}
        onPress={() => setOpen((v) => !v)}
        className="min-h-11 flex-row items-center gap-3"
      >
        <DotAvatar definition={definition} size={34} still float={false} />
        <Text variant="section" className="flex-1">
          {label}
        </Text>
        {collapsible ? (
          open ? (
            <ChevronUp size={20} strokeWidth={1.75} color="#78809b" />
          ) : (
            <ChevronDown size={20} strokeWidth={1.75} color="#78809b" />
          )
        ) : null}
      </Pressable>

      {open ? (
        <View className="mt-4">
          {steps.map((step, i) => (
            <StepRow
              key={step.id}
              step={step}
              icon={icons?.[step.id]}
              connected={i < steps.length - 1}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
