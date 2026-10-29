import { useDotDraft } from "@/components/dots/dot-draft";
import { DotCustomizer } from "@/components/dots/dot-customizer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Reveal } from "@/components/onboarding/reveal";
import { router } from "expo-router";
import { useState } from "react";

export default function CustomizeDot() {
  const { draft, update } = useDotDraft();
  const [error, setError] = useState<string>();

  const submit = () => {
    if (!draft.name.trim()) {
      setError("Give your Dot a name");
      return;
    }
    setError(undefined);
    router.push("/dot/new/setup");
  };

  return (
    <OnboardingShell
      title="Customize your Dot"
      subtitle="Give your Dot a look and a name. You can always change it later."
      submitLabel="Continue"
      onSubmit={submit}
      step={{ total: 2, current: 1 }}
    >
      <Reveal delay={160} className="mt-6">
        <DotCustomizer
          // Arrows step through shapes — the template flow's extra affordance.
          showArrows
          value={{ shape: draft.shape, color: draft.color, name: draft.name }}
          onChange={(next) => {
            update(next);
            if (error && next.name.trim()) setError(undefined);
          }}
          error={error}
        />
      </Reveal>
    </OnboardingShell>
  );
}
