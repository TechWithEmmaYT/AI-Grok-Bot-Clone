import { Text as RNText, type TextProps } from "react-native";
import { cn } from "./screen";

const VARIANTS = {
  display: "font-display text-[34px] leading-[40px] tracking-tight text-foreground",
  title: "font-display text-[28px] leading-[34px] tracking-tight text-foreground",
  section: "font-bold text-[17px] leading-[22px] text-foreground",
  cardTitle: "font-bold text-[17px] leading-[22px] text-foreground",
  body: "font-sans text-[16px] leading-[24px] text-foreground",
  secondary: "font-sans text-[14px] leading-[20px] text-muted-foreground",
  label: "font-semibold text-[13px] leading-[18px] text-foreground",
} as const;

export type TextVariant = keyof typeof VARIANTS;

type Props = TextProps & {
  variant?: TextVariant;
  className?: string;
};

/** React Native text does not inherit colour or family, so every Text goes through here. */
export function Text({ variant = "body", className, ...rest }: Props) {
  return <RNText className={cn(VARIANTS[variant], className)} {...rest} />;
}
