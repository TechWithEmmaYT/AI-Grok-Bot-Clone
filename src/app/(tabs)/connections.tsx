import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

// Composio providers — no reference design
export default function Connections() {
  return (
    <Screen edges={["top"]} contentClassName="px-5">
      <View className="h-11 justify-center">
        <Text variant="display">Connections</Text>
      </View>
    </Screen>
  );
}
