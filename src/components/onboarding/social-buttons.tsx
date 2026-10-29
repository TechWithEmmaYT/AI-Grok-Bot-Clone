import { ProviderButton } from "@/components/ui/provider-button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/sonner";
import { useState } from "react";
import { View } from "react-native";
import { Reveal } from "./reveal";

type Provider = "google" | "apple";

/**
 * Social sign-in through Better Auth's browser flow.
 *
 * Both providers are wired, but neither works until GOOGLE_CLIENT_ID /
 * GOOGLE_CLIENT_SECRET (and the Apple Service ID + key) are configured and the
 * callback URLs are registered. Until then the server rejects the request and
 * the error surfaces here rather than failing silently.
 */
export function SocialButtons() {
  const [pending, setPending] = useState<Provider | null>(null);

  const start = async (provider: Provider) => {
    setPending(provider);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
      if (error) {
        toast.error(`${provider === "google" ? "Google" : "Apple"} sign-in is not set up yet.`);
      }
    } catch {
      toast.error("Could not reach the sign-in service.");
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Reveal delay={80} className="mt-8 gap-3">
        <ProviderButton
          provider="google"
          label="Continue with Google"
          disabled={pending !== null}
          onPress={() => start("google")}
        />
        <ProviderButton
          provider="apple"
          label="Continue with Apple"
          disabled={pending !== null}
          onPress={() => start("apple")}
        />
      </Reveal>

      <Reveal delay={140} className="my-7 flex-row items-center gap-4">
        <View className="h-px flex-1 bg-border" />
        <Text variant="secondary">or</Text>
        <View className="h-px flex-1 bg-border" />
      </Reveal>
    </>
  );
}
