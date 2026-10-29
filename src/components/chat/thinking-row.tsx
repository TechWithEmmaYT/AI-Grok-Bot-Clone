import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook, type DotColor, type DotShape } from "@/components/dots/dotLooks";
import { Text } from "@/components/ui/text";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

/**
 * The first entry is the honest default and is never returned to, so a glance
 * at a long turn never shows the same word twice in a row.
 */
const LABELS = [
  "Dot is working on it...",
  "Thinking...",
  "Reasoning...",
  "Digging in...",
  "Pondering...",
  "Untangling...",
  "Flabbergasted...",
  "Nearly there...",
];

const ROTATE_MS = 2800;

type Props = {
  shape?: DotShape;
  color?: DotColor;
  /** Live reasoning tokens, shown under the label as they arrive. */
  reasoning?: string;
};

/**
 * Shown from the moment a message is sent until the first token of the reply.
 *
 * Deliberately unframed — no card, border or chrome — so it reads as the Dot
 * itself working. The label rotates so a long turn never looks frozen, and the
 * model's own reasoning sits underneath, which is the part that actually tells
 * the user what is happening rather than just that something is.
 */
export function ThinkingRow({ shape = "blob", color = "blue", reasoning }: Props) {
  const definition = useMemo(() => withLook(base, shape, color), [shape, color]);
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // A label that changes on its own is motion too: Reduce Motion keeps the
    // plain, honest first line and nothing else.
    if (reduceMotion) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % LABELS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const label = reduceMotion ? LABELS[0] : LABELS[index];

  return (
    <View className="gap-2">
      <View
        accessibilityRole="progressbar"
        // Always the stable wording, so a screen reader is not re-announcing a
        // new adjective every few seconds.
        accessibilityLabel={LABELS[0]}
        className="flex-row items-center gap-2"
      >
        <DotAvatar definition={definition} animation="idle" size={28} float={false} />
        <Text variant="secondary">{label}</Text>
      </View>

      {reasoning ? (
        <Text variant="secondary" className="pl-9 opacity-70">
          {reasoning}
        </Text>
      ) : null}
    </View>
  );
}
