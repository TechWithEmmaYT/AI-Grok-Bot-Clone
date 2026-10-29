import { cn } from "@/components/ui/screen";
import { View } from "react-native";

type Props = { total: number; current: number };

/** Honest progress for a known-length flow — never a misleading "Step N of M". */
export function StepDots({ total, current }: Props) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current} of ${total}`}
      className="flex-row items-center justify-center gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={cn(
            "h-1.5 rounded-pill",
            i < current ? "w-5 bg-primary" : "w-3 bg-border",
          )}
        />
      ))}
    </View>
  );
}
