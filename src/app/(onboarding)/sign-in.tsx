import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { AuthSwitchLink } from "@/components/onboarding/auth-switch-link";
import { Reveal } from "@/components/onboarding/reveal";
import { SocialButtons } from "@/components/onboarding/social-buttons";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/sonner";
import { signInSchema, type SignInValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { Pressable } from "react-native";

export default function SignIn() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      // Deliberately generic: a precise message would confirm which accounts exist.
      toast.error("That email and password do not match.");
      return;
    }

    // Returning users already have Dots — straight into the app, not into
    // "create your first Dot". The tabs layout gates on the new session.
    router.replace("/");
  });

  return (
    <OnboardingShell
      title="Welcome back"
      subtitle="Sign in to pick up where your Dots left off."
      submitLabel="Sign in"
      onSubmit={onSubmit}
      loading={isSubmitting}
      footer={
        <AuthSwitchLink
          prompt="Don't have an account?"
          action="Sign up"
          href="/sign-up"
        />
      }
    >
      <SocialButtons />

      <Reveal delay={200} className="gap-5">
        <FormField
          control={control}
          name="email"
          label="Email address"
          icon={Mail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          inputMode="email"
          keyboardType="email-address"
          returnKeyType="next"
          textContentType="emailAddress"
        />

        <FormField
          secure
          control={control}
          name="password"
          label="Password"
          placeholder="Your password"
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />

        <Pressable
          accessibilityRole="button"
          className="min-h-11 justify-center self-start"
        >
          <Text variant="secondary" className="font-medium text-primary">
            Forgot password?
          </Text>
        </Pressable>
      </Reveal>
    </OnboardingShell>
  );
}
