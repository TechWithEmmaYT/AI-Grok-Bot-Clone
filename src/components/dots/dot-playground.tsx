import base from "@/assets/dot.avatar.json";
import grok from "@/assets/grok-bot.avatar.json";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DotAvatar } from "./dot-avatar";
import {
  DOT_COLORS,
  DOT_SHAPES,
  withLook,
  type DotColor,
  type DotShape,
} from "./dotLooks";

type Shape = DotShape | "grok";
const SHAPES: Shape[] = ["grok", ...(Object.keys(DOT_SHAPES) as DotShape[])];
const STATES = [
  "idle",
  "listening",
  "thinking",
  "searching",
  "working",
  "happy",
  "excited",
  "sleeping",
];

// grok = its own black orb + its own expressions; everything else = Dot base with a new look
const lookFor = (shape: Shape, color: DotColor) =>
  shape === "grok" ? grok : withLook(base, shape, color);

export default function DotPlayground() {
  const [anim, setAnim] = useState("idle");
  const [shape, setShape] = useState<Shape>("blob");
  const [color, setColor] = useState<DotColor>("blue");
  const def = useMemo(() => lookFor(shape, color), [shape, color]);
  const tiles = useMemo(
    () => SHAPES.map((k) => [k, lookFor(k, color)] as const),
    [color],
  );

  return (
    <ScrollView contentContainerStyle={s.root}>
      <DotAvatar definition={def} animation={anim} size={240} />
      <Text style={s.title}>
        {shape === "grok" ? "Grok" : "Dot"} · {anim}
      </Text>

      <Text style={s.h}>Choose a shape</Text>
      <View style={s.row}>
        {tiles.map(([k, d]) => (
          <Pressable
            key={k}
            testID={`shape-${k}`}
            onPress={() => setShape(k)}
            style={[s.tile, k === shape && s.sel]}
          >
            <DotAvatar definition={d} size={40} glossy={false} still />
          </Pressable>
        ))}
      </View>

      {shape !== "grok" && (
        <>
          <Text style={s.h}>Choose a color</Text>
          <View style={s.row}>
            {(Object.keys(DOT_COLORS) as DotColor[]).map((k) => (
              <Pressable
                key={k}
                testID={`color-${k}`}
                onPress={() => setColor(k)}
                style={[s.dotWrap, k === color && s.sel]}
              >
                <View style={[s.dot, { backgroundColor: DOT_COLORS[k] }]} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={s.h}>Animation</Text>
      <View style={s.row}>
        {STATES.map((a) => (
          <Pressable
            key={a}
            testID={`btn-${a}`}
            onPress={() => setAnim(a)}
            style={[s.btn, a === anim && s.on]}
          >
            <Text style={a === anim ? s.onTxt : undefined}>{a}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
    backgroundColor: "#fff",
  },
  title: { fontSize: 16, fontWeight: "600" },
  h: {
    alignSelf: "flex-start",
    marginLeft: 20,
    fontSize: 15,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  tile: {
    padding: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e8ee",
  },
  sel: { borderColor: "#2563ff", borderWidth: 2 },
  dotWrap: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dot: { width: 30, height: 30, borderRadius: 999 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eef1f7",
  },
  on: { backgroundColor: "#111" },
  onTxt: { color: "#fff" },
});
