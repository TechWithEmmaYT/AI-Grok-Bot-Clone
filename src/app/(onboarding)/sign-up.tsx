import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { AuthSwitchLink } from "@/components/onboarding/auth-switch-link";
import { Reveal } from "@/components/onboarding/reveal";
import { useSignUpDraft } from "@/components/onboarding/sign-up-draft";
import { SocialButtons } from "@/components/onboarding/social-buttons";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import { signUpIdentitySchema, type SignUpIdentityValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Mail, User } from "lucide-react-native";
import { useForm } from "react-hook-form";

export default function SignUp() {
  const { draft, setIdentity } = useSignUpDraft();

  const { control, handleSubmit } = useForm<SignUpIdentityValues>({
    resolver: zodResolver(signUpIdentitySchema),
    defaultValues: { name: draft.name, email: draft.email },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit((values) => {
    setIdentity(values);
    router.push("/sign-up-password");
  });

  return (
    <OnboardingShell
      title="Create your account"
      subtitle="Join Dot and start building your AI agents today."
      submitLabel="Continue"
      onSubmit={onSubmit}
      step={{ total: 3, current: 1 }}
      footer={
        <>
          <AuthSwitchLink
            prompt="Already have an account?"
            action="Sign in"
            href="/sign-in"
          />
          <Text variant="secondary" className="mt-4 text-center">
            By continuing, you agree to our{" "}
            <Text variant="secondary" className="text-primary">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text variant="secondary" className="text-primary">
              Privacy Policy
            </Text>
            .
          </Text>
        </>
      }
    >
      <SocialButtons />

      <Reveal delay={200} className="gap-5">
        <FormField
          control={control}
          name="name"
          label="Your name"
          icon={User}
          placeholder="Emma"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          textContentType="name"
        />

        <FormField
          control={control}
          name="email"
          label="Email address"
          icon={Mail}
          placeholder="you@example.com"
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          inputMode="email"
          keyboardType="email-address"
          returnKeyType="go"
          textContentType="emailAddress"
        />
      </Reveal>
    </OnboardingShell>
  );
}
