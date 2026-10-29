import { Stack } from "expo-router";

/** Task screens sit above the tabs: a full-attention flow, not a peer tab. */
export default function TaskLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}
