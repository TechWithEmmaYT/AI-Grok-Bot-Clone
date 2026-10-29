import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Input } from "./input";
import { PasswordInput } from "./password-input";

type InputProps = React.ComponentProps<typeof Input>;
type PasswordProps = React.ComponentProps<typeof PasswordInput>;

type Props<T extends FieldValues> = Omit<
  InputProps & PasswordProps,
  "value" | "onChangeText" | "onBlur" | "error"
> & {
  control: Control<T>;
  name: Path<T>;
  /** Renders the password variant, with its visibility toggle. */
  secure?: boolean;
};

/**
 * Bridges react-hook-form to the Input primitives. The zod resolver owns the
 * message, so screens never hand-roll validation copy.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  secure = false,
  ...rest
}: Props<T>) {
  const Field = secure ? PasswordInput : Input;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          {...rest}
          value={field.value ?? ""}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
