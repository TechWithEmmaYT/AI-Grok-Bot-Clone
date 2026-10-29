import { Button } from "@/components/ui/button";
import { cn, Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { ArrowRight, ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Reveal } from "./reveal";
import { StepDots } from "./step-dots";

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Omit for single-screen flows like sign-in. */
  step?: { total: number; current: number };
  loading?: boolean;
  /**
   * Set false once the flow has passed a point of no return — after the
   * account exists there is nothing behind this screen to go back to.
   */
  showBack?: boolean;
};

/**
 * Shared frame for every onboarding screen: optional back affordance and
 * progress, heading block, caller-supplied fields, and the primary action.
 */
export function OnboardingShell({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  children,
  footer,
  step,
  loading = false,
  showBack = true,
}: Props) {
  return (
    <Screen scroll contentClassName="px-5 pb-6">
      <View className="h-11 flex-row items-center">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            // router.back() is a no-op with an empty history, which happens on a
            // deep link straight into this screen. Fall back to the flow's start.
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/welcome")
            }
            className="-ml-2 size-11 items-center justify-center"
          >
            <ChevronLeft size={24} strokeWidth={1.75} color="#111111" />
          </Pressable>
        ) : null}
        {step ? (
          // The right padding only compensates for the back button's width,
          // so the dots stay optically centred when it is present.
          <View className={cn("flex-1", showBack && "pr-9")}>
            <StepDots total={step.total} current={step.current} />
          </View>
        ) : null}
      </View>

      <Reveal delay={0} className="mt-6">
        <Text variant="title" className="text-center">
          {title}
        </Text>
        <Text variant="body" className="mt-3 text-center text-muted-foreground">
          {subtitle}
        </Text>
      </Reveal>

      {children}

      <Reveal delay={260} className="mt-7">
        <Button
          label={submitLabel}
          loading={loading}
          onPress={onSubmit}
          trailing={<ArrowRight size={20} strokeWidth={1.75} color="#ffffff" />}
        />
      </Reveal>

      {footer ? (
        <Reveal delay={320} className="mt-6">
          {footer}
        </Reveal>
      ) : null}
    </Screen>
  );
}
