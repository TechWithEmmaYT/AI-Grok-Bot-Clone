import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

// Account and usage — no reference design
export default function You() {
  return (
    <Screen edges={["top"]} contentClassName="px-5">
      <View className="h-11 justify-center">
        <Text variant="display">You</Text>
      </View>
    </Screen>
  );
}
