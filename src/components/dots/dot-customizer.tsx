import base from "@/assets/dot.avatar.json";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { DotAvatar } from "./dot-avatar";
import {
  DOT_COLORS,
  DOT_SHAPES,
  withLook,
  type DotColor,
  type DotShape,
} from "./dotLooks";

const SHAPES = Object.keys(DOT_SHAPES) as DotShape[];
const COLORS = Object.keys(DOT_COLORS) as DotColor[];

/**
 * Decorative tint per shape tile, matching the reference designs — the row
 * reads as a palette of characters rather than eight copies of one colour.
 * Independent of the selected colour on purpose.
 */
const TILE_TINT: DotColor[] = [
  "blue",
  "purple",
  "pink",
  "orange",
  "green",
  "yellow",
  "blue",
  "purple",
];

export type DotLook = { shape: DotShape; color: DotColor; name: string };

type Props = {
  value: DotLook;
  onChange: (next: DotLook) => void;
  /** Carousel arrows beside the preview, as in the template flow. */
  showArrows?: boolean;
  nameLabel?: string;
  namePlaceholder?: string;
  error?: string;
};

/**
 * Shape, colour and name picker shared by "Create your first Dot" (onboarding)
 * and "Customize your Dot" (template flow). The screens own their heading,
 * progress and call to action; this owns the look.
 */
export function DotCustomizer({
  value,
  onChange,
  showArrows = false,
  nameLabel = "Name your Dot",
  namePlaceholder = "Dot",
  error,
}: Props) {
  const preview = useMemo(
    () => withLook(base, value.shape, value.color),
    [value.shape, value.color],
  );

  const tiles = useMemo(
    () => SHAPES.map((shape, i) => [shape, withLook(base, shape, TILE_TINT[i])] as const),
    [],
  );

  const step = (delta: number) => {
    const i = SHAPES.indexOf(value.shape);
    const next = SHAPES[(i + delta + SHAPES.length) % SHAPES.length];
    onChange({ ...value, shape: next });
  };

  return (
    <View>
      {/* Preview */}
      <View className="flex-row items-center justify-center">
        {showArrows ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous shape"
            hitSlop={8}
            onPress={() => step(-1)}
            className="size-11 items-center justify-center rounded-pill border border-border bg-card"
          >
            <ChevronLeft size={20} strokeWidth={1.75} color="#111111" />
          </Pressable>
        ) : null}

        <DotAvatar
          definition={preview}
          animation="idle"
          size={188}
          fps={60}
          label={`${value.name || "Your Dot"}, ${value.shape}, ${value.color}`}
        />

        {showArrows ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next shape"
            hitSlop={8}
            onPress={() => step(1)}
            className="size-11 items-center justify-center rounded-pill border border-border bg-card"
          >
            <ChevronRight size={20} strokeWidth={1.75} color="#111111" />
          </Pressable>
        ) : null}
      </View>

      {/* Shape */}
      <Text variant="label" className="mb-3 mt-2">
        Choose a shape
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row justify-between gap-2">
        {tiles.map(([shape, definition]) => {
          const selected = shape === value.shape;
          return (
            <Pressable
              key={shape}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={shape}
              onPress={() => onChange({ ...value, shape })}
              className={cn(
                "aspect-square flex-1 items-center justify-center rounded-tile border",
                selected ? "border-2 border-primary bg-secondary" : "border-border bg-card",
              )}
            >
              <DotAvatar definition={definition} size={34} still float={false} />
            </Pressable>
          );
        })}
      </View>

      {/* Colour */}
      <Text variant="label" className="mb-3 mt-6">
        Choose a color
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row justify-between gap-2">
        {COLORS.map((color) => {
          const selected = color === value.color;
          return (
            <Pressable
              key={color}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={color}
              onPress={() => onChange({ ...value, color })}
              className={cn(
                "aspect-square flex-1 items-center justify-center rounded-pill border-2",
                selected ? "border-primary" : "border-transparent",
              )}
            >
              <View
                className={cn(
                  "size-[82%] rounded-pill",
                  color === "white" && "border border-border",
                )}
                style={{ backgroundColor: DOT_COLORS[color] }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Name */}
      <Input
        containerClassName="mt-6"
        label={nameLabel}
        placeholder={namePlaceholder}
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
        error={error}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={40}
        returnKeyType="done"
        trailing={
          value.name ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear name"
              hitSlop={10}
              onPress={() => onChange({ ...value, name: "" })}
              className="size-11 items-center justify-center"
            >
              <X size={18} strokeWidth={2} color="#78809b" />
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}
