import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook, type DotColor, type DotShape } from "@/components/dots/dotLooks";
import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import {
  Calendar,
  FileText,
  Globe,
  Layers,
  Search,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

const ACTIONS: {
  key: string;
  Icon: LucideIcon;
  color: string;
  tile: string;
  label: string;
  prompt: string;
}[] = [
  {
    key: "research",
    Icon: Search,
    color: "#0268fe",
    tile: "bg-secondary",
    label: "Research\nanything",
    prompt: "Research ",
  },
  {
    key: "browse",
    Icon: Globe,
    color: "#a246f9",
    tile: "bg-[#f3e9fe]",
    label: "Browse\nthe web",
    prompt: "Open and summarise ",
  },
  {
    key: "act",
    Icon: Zap,
    color: "#fe7b0f",
    tile: "bg-warning-muted",
    label: "Take action\nfor you",
    prompt: "Draft and send ",
  },
  {
    key: "files",
    Icon: FileText,
    color: "#00c755",
    tile: "bg-success-muted",
    label: "Analyze files",
    prompt: "Analyse this file: ",
  },
  {
    key: "apps",
    Icon: Layers,
    color: "#fd469f",
    tile: "bg-[#feeaf4]",
    label: "Use your apps",
    prompt: "In my apps, ",
  },
  {
    key: "task",
    Icon: Calendar,
    color: "#a246f9",
    tile: "bg-[#f3e9fe]",
    label: "Create a task",
    prompt: "Every morning at 8am, ",
  },
];

type Props = {
  userName: string;
  shape: DotShape;
  color: DotColor;
  onPickAction?: (prompt: string) => void;
};

/** First-run state: the Dot, a greeting, and six ways in. */
export function ChatGreeting({ userName, shape, color, onPickAction }: Props) {
  const definition = useMemo(() => withLook(base, shape, color), [shape, color]);

  return (
    <View className="items-center px-5 pb-6 pt-2">
      <DotAvatar definition={definition} animation="idle" size={176} fps={60} />

      <Text variant="title" className="mt-4 text-center">
        {`Hi ${userName} 👋`}
      </Text>
      <Text variant="body" className="mt-2 text-center text-muted-foreground">
        What would you like me to do today?
      </Text>

      <View className="mt-7 w-full flex-row flex-wrap gap-3">
        {ACTIONS.map(({ key, Icon, color: iconColor, tile, label, prompt }) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={label.replace("\n", " ")}
            onPress={() => onPickAction?.(prompt)}
            // Three columns: each tile is a third of the row minus the gaps.
            className={cn("min-h-28 flex-1 basis-[30%] rounded-card p-4", tile)}
          >
            <Icon size={22} strokeWidth={1.75} color={iconColor} />
            <Text variant="label" className="mt-3">
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
