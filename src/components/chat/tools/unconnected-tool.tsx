import type { ToolKey } from "@/db/app-schema";
import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { TOOLS } from "@/lib/tools";
import { ArrowRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { ToolCard } from "./tool-card";

type Props = {
  toolKey: ToolKey;
  /** Starts the Composio connection flow for this provider. */
  onConnect?: () => void;
  connecting?: boolean;
};

/**
 * The Dot reached for a tool whose account is not linked yet.
 *
 * Shown inline where the tool call would have been, so the run reads as paused
 * rather than failed — the user can connect and carry on without leaving chat.
 * Connecting goes through Composio's per-user OAuth; this is the UI half only.
 */
export function UnconnectedTool({ toolKey, onConnect, connecting = false }: Props) {
  const tool = TOOLS.find((t) => t.key === toolKey);
  if (!tool) return null;

  const { label, description, Icon, color, tile } = tool;

  return (
    <ToolCard
      icon={
        <View className={cn("size-9 items-center justify-center rounded-tile", tile)}>
          <Icon size={18} strokeWidth={1.75} color={color} />
        </View>
      }
      label={label}
      badge={{ label: "Not connected", tone: "idle" }}
    >
      <View className="px-4 pb-4">
        <Text variant="body" className="text-muted-foreground">
          {`Connect your ${label} account to let this Dot ${description.toLowerCase()}.`}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Connect ${label}`}
          accessibilityState={{ disabled: connecting, busy: connecting }}
          disabled={connecting}
          onPress={onConnect}
          className={cn(
            "mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-pill bg-foreground px-5",
            connecting && "opacity-50",
          )}
        >
          <Text variant="cardTitle" className="text-background">
            {connecting ? "Opening…" : `Connect ${label}`}
          </Text>
          {connecting ? null : (
            <ArrowRight size={18} strokeWidth={1.75} color="#ffffff" />
          )}
        </Pressable>

        <Text variant="secondary" className="mt-3 text-center">
          You can disconnect any time from Connections.
        </Text>
      </View>
    </ToolCard>
  );
}
