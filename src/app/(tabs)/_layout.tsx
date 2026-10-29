import { LoadingScreen } from "@/components/ui/loading-screen";
import { authClient } from "@/lib/auth-client";
import { Redirect, Tabs } from "expo-router";
import { Clock, House, Link2, User } from "lucide-react-native";
import { useCSSVariable } from "uniwind";

/**
 * Four product areas, matching the bar in every reference screen.
 * Colours come from the live Uniwind variables so the bar follows the theme.
 *
 * This layout is also the auth gate: the product lives at "/", and anyone
 * without a session is sent to onboarding. Returning null while the session
 * resolves keeps the splash up rather than flashing a signed-out screen.
 */
export default function TabsLayout() {
  const { data: session, isPending } = authClient.useSession();

  const [primary, muted, background, border] = useCSSVariable([
    "--color-primary",
    "--color-muted-foreground",
    "--color-background",
    "--color-border",
  ]);

  if (isPending) return <LoadingScreen />;
  if (!session) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary as string,
        tabBarInactiveTintColor: muted as string,
        tabBarStyle: {
          backgroundColor: background as string,
          borderTopColor: border as string,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <House size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <Clock size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          title: "Connections",
          tabBarIcon: ({ color, size }) => (
            <Link2 size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "You",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />
    </Tabs>
  );
}
