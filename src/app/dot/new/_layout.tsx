import { DotDraftProvider } from "@/components/dots/dot-draft";
import { Stack } from "expo-router";

/** The four creation steps share one draft and never animate between routes. */
export default function DotCreationLayout() {
  return (
    <DotDraftProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </DotDraftProvider>
  );
}
