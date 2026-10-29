import type { LucideIcon } from "lucide-react-native";
import { forwardRef, type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useCSSVariable } from "uniwind";
import { cn } from "./screen";
import { Text } from "./text";

type Props = TextInputProps & {
  label?: string;
  /** Leading glyph inside the field — pass a lucide icon component. */
  icon?: LucideIcon;
  /** Shown below the field and announced; also turns the border destructive. */
  error?: string;
  /** Rendered at the trailing edge inside the field, e.g. a visibility toggle. */
  trailing?: ReactNode;
  /** Help text under the field, replaced by `error` when present. */
  hint?: string;
  containerClassName?: string;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, icon: LeadingIcon, error, trailing, hint, containerClassName, className, ...rest },
  ref,
) {
  const [muted, foreground, destructive] = useCSSVariable([
    "--color-muted-foreground",
    "--color-foreground",
    "--color-destructive",
  ]);

  return (
    <View className={containerClassName}>
      {label ? (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          "min-h-14 flex-row items-center gap-3 rounded-control border bg-card px-4",
          error ? "border-destructive" : "border-border",
        )}
      >
        {LeadingIcon ? (
          <LeadingIcon
            size={20}
            strokeWidth={1.75}
            color={(error ? destructive : muted) as string}
          />
        ) : null}
        <TextInput
          ref={ref}
          className={cn("flex-1 font-sans text-[16px] text-foreground", className)}
          placeholderTextColor={muted as string}
          selectionColor={foreground as string}
          accessibilityLabel={label}
          {...rest}
        />
        {trailing}
      </View>

      {error ? (
        <Text
          variant="secondary"
          className="mt-2 text-destructive"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : hint ? (
        <Text variant="secondary" className="mt-2">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
