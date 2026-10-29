// Must come first: installs the global `crypto` the Trigger chat SDK calls
// into before any other module can reach for it.
import "@/lib/crypto-polyfill";

import "../global.css";

import { AppToaster } from "@/components/app-toaster";
import { QueryProvider } from "@/components/query-client";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const { theme, hasAdaptiveThemes } = useUniwind();
  // Every variable read here must also appear in a className somewhere, or
  // Tailwind tree-shakes it out of the generated CSS and the lookup fails.
  const [background, card, foreground, border, primary, muted] = useCSSVariable(
    [
      "--color-background",
      "--color-card",
      "--color-foreground",
      "--color-border",
      "--color-primary",
      "--color-muted-foreground",
    ],
  );

  const dark = theme === "dark";
  const toasterTheme = hasAdaptiveThemes ? "system" : theme;

  const navigationTheme = useMemo(
    () => ({
      ...(dark ? DarkTheme : DefaultTheme),
      colors: {
        ...(dark ? DarkTheme.colors : DefaultTheme.colors),
        background: background as string,
        card: card as string,
        text: foreground as string,
        border: border as string,
        primary: primary as string,
        notification: primary as string,
      },
    }),
    [background, border, card, dark, foreground, primary],
  );

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SafeAreaProvider>
          <SafeAreaListener
            onChange={({ insets }) => Uniwind.updateInsets(insets)}
          >
            <ThemeProvider value={navigationTheme}>
              <View className="flex-1 bg-background">
                <StatusBar style={dark ? "light" : "dark"} />
                <Stack screenOptions={{ headerShown: false }} />
                <AppToaster
                  background={card as string}
                  border={border as string}
                  foreground={foreground as string}
                  muted={muted as string}
                  theme={toasterTheme as "light" | "dark" | "system"}
                />
              </View>
            </ThemeProvider>
          </SafeAreaListener>
        </SafeAreaProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
