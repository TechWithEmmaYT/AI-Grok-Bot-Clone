import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Reveal } from "@/components/onboarding/reveal";
import { useSignUpDraft } from "@/components/onboarding/sign-up-draft";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/sonner";
import { signUpPasswordSchema, type SignUpPasswordValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router } from "expo-router";
import { useForm } from "react-hook-form";

export default function SignUpPassword() {
  const { draft, reset } = useSignUpDraft();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpPasswordValues>({
    resolver: zodResolver(signUpPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Reached directly (deep link, reload) with no step-one answers to build on.
  if (!draft.email) return <Redirect href="/sign-up" />;

  const onSubmit = handleSubmit(async ({ password }) => {
    const { error } = await authClient.signUp.email({
      name: draft.name,
      email: draft.email,
      password,
    });

    if (error) {
      // Server copy, not raw internals.
      toast.error(error.message ?? "Could not create your account. Try again.");
      return;
    }

    reset();
    router.replace("/create-dot");
  });

  return (
    <OnboardingShell
      title="Choose a password"
      subtitle="Almost there — this secures your account."
      submitLabel="Create account"
      onSubmit={onSubmit}
      loading={isSubmitting}
      step={{ total: 3, current: 2 }}
    >
      <Reveal delay={120} className="mt-2">
        <Text variant="body" className="text-center font-semibold text-foreground">
          {draft.email}
        </Text>
      </Reveal>

      <Reveal delay={200} className="mt-8 gap-5">
        <FormField
          secure
          isNew
          control={control}
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          hint="Use at least 8 characters."
          returnKeyType="next"
        />

        <FormField
          secure
          isNew
          control={control}
          name="confirm"
          label="Confirm password"
          placeholder="Re-enter your password"
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />

        <Text variant="secondary">
          Signing up as{" "}
          <Text variant="secondary" className="font-semibold text-foreground">
            {draft.name}
          </Text>
        </Text>
      </Reveal>
    </OnboardingShell>
  );
}
