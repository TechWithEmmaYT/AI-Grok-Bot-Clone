import { Eye, EyeOff, Lock } from "lucide-react-native";
import { forwardRef, useState } from "react";
import { Pressable, type TextInput } from "react-native";
import { Input } from "./input";

type Props = React.ComponentProps<typeof Input> & {
  /** true on sign-up / confirm fields, false when entering an existing password. */
  isNew?: boolean;
};

export const PasswordInput = forwardRef<TextInput, Props>(function PasswordInput(
  { isNew = false, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      icon={Lock}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoComplete={isNew ? "new-password" : "current-password"}
      autoCorrect={false}
      textContentType={isNew ? "newPassword" : "password"}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={10}
          onPress={() => setVisible((v) => !v)}
          className="size-11 items-center justify-center"
        >
          {visible ? (
            <EyeOff size={20} strokeWidth={1.75} color="#78809b" />
          ) : (
            <Eye size={20} strokeWidth={1.75} color="#78809b" />
          )}
        </Pressable>
      }
      {...rest}
    />
  );
});
