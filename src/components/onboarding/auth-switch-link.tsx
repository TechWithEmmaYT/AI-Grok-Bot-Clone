import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = { prompt: string; action: string; href: "/sign-in" | "/sign-up" };

/** Cross-link between sign-in and sign-up so neither screen is a dead end. */
export function AuthSwitchLink({ prompt, action, href }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${prompt} ${action}`}
        className="min-h-11 items-center justify-center"
      >
        {/* One Text node: a flex gap between separate Texts does not render
            reliably here, and nesting keeps the baseline aligned. */}
        <Text variant="secondary">
          {prompt}{" "}
          <Text variant="secondary" className="font-semibold text-primary">
            {action}
          </Text>
        </Text>
      </Pressable>
    </Link>
  );
}
