import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import Animated, { FadeInUp, ReduceMotion } from "react-native-reanimated";

type Props = ViewProps & {
  children: ReactNode;
  /** Stagger offset in ms. Keep steps 40–80ms apart in reading order. */
  delay?: number;
  className?: string;
};

/**
 * Content entrance for onboarding beats: visual anchor -> headline ->
 * explanation -> body -> CTA. Routes themselves never animate.
 *
 * Reanimated resolves ReduceMotion.System at runtime, so the final state
 * appears immediately when the OS setting is on — no travel, no delay.
 */
export function Reveal({ children, delay = 0, className, ...rest }: Props) {
  return (
    <Animated.View
      className={className}
      entering={FadeInUp.duration(260)
        .delay(delay)
        .withInitialValues({ transform: [{ translateY: 12 }] })
        .reduceMotion(ReduceMotion.System)}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
