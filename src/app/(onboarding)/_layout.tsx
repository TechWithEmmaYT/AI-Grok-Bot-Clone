import { SignUpDraftProvider } from "@/components/onboarding/sign-up-draft";
import { Stack } from "expo-router";

/**
 * Onboarding is one continuous surface: the route container never animates,
 * each screen choreographs its own content instead.
 */
export default function OnboardingLayout() {
  return (
    <SignUpDraftProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </SignUpDraftProvider>
  );
}
