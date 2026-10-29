import { DotCustomizer, type DotLook } from "@/components/dots/dot-customizer";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Reveal } from "@/components/onboarding/reveal";
import { createDot, queryKeys } from "@/lib/api";
import { toast } from "@/lib/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

const DEFAULT_LOOK: DotLook = { shape: "blob", color: "blue", name: "Dot" };

/** Every Dot starts able to research and browse; the rest are opt-in. */
const STARTER_TOOLS = ["treg_research", "web_browser"] as const;

export default function CreateDot() {
  const [look, setLook] = useState<DotLook>(DEFAULT_LOOK);
  const [error, setError] = useState<string>();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createDot,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.allDots });
      router.replace("/");
    },
    onError: (e: Error) => toast.error(e.message || "Could not create your Dot."),
  });

  const submit = () => {
    const name = look.name.trim();
    if (!name) {
      setError("Give your Dot a name");
      return;
    }
    setError(undefined);
    mutate({
      name,
      shape: look.shape,
      color: look.color,
      tools: [...STARTER_TOOLS],
    });
  };

  return (
    <OnboardingShell
      title="Create your first Dot"
      subtitle="Give your Dot a look and a name. You can always change it later."
      submitLabel="Create Dot"
      onSubmit={submit}
      loading={isPending}
      step={{ total: 3, current: 3 }}
      // The account already exists by the time this screen renders, so there
      // is nothing behind it — sign-up arrived here with router.replace.
      showBack={false}
    >
      <Reveal delay={160} className="mt-6">
        <DotCustomizer
          value={look}
          onChange={(next) => {
            setLook(next);
            if (error && next.name.trim()) setError(undefined);
          }}
          error={error}
        />
      </Reveal>
    </OnboardingShell>
  );
}
