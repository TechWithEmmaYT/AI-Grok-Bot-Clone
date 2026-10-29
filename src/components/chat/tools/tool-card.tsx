import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import type { ReactNode } from "react";
import { View } from "react-native";

export type ToolBadge = { label: string; tone: "live" | "done" | "idle" | "error" };

const TONE: Record<ToolBadge["tone"], string> = {
  live: "bg-success-muted text-success",
  done: "bg-success-muted text-success",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
};

type Props = {
  icon: ReactNode;
  label: string;
  badge?: ToolBadge;
  children?: ReactNode;
  /** Pinned under the body, e.g. an expand control. */
  footer?: ReactNode;
  className?: string;
};

/**
 * Shared frame for every tool surface in the conversation: a labelled header
 * with an optional status badge, a body the specific tool owns, and a footer.
 * Keeping the chrome here is what makes browser, connect and generic tools
 * read as one family rather than three separate inventions.
 */
export function ToolCard({ icon, label, badge, children, footer, className }: Props) {
  return (
    <View className={cn("overflow-hidden rounded-card border border-border bg-card", className)}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        {icon}
        <Text variant="cardTitle" className="flex-1">
          {label}
        </Text>
        {badge ? (
          <View className={cn("rounded-pill px-2.5 py-1", TONE[badge.tone].split(" ")[0])}>
            <Text variant="label" className={TONE[badge.tone].split(" ")[1]}>
              {badge.label}
            </Text>
          </View>
        ) : null}
      </View>

      {children}
      {footer}
    </View>
  );
}
