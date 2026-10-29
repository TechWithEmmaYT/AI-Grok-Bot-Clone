import {
  advanceAvatarPlayback,
  playAvatarAnimation,
  renderAvatarFrame,
  sampleAvatarFrame,
  validateAvatarDefinition,
  type AvatarDefinition,
} from "@bible-strong/avatar-core";
import {
  memo,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const FLOAT_LIFT = 6; // viewBox units
const FLOAT_PERIOD_MS = 3000;

const now = () =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();

/** Mix a hex colour toward white (amt > 0) or black (amt < 0). */
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const t = amt > 0 ? 255 : 0;
  const a = Math.abs(amt);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(v + (t - v) * a),
  );
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

type Props = {
  /** The .avatar.json exported from the Studio. */
  definition: unknown;
  /** e.g. 'idle' | 'thinking' | 'listening' | 'working'. */
  animation?: string;
  size?: number;
  /** 3D-ish gradient, highlight and floor shadow. */
  glossy?: boolean;
  /** Gentle hover bob. Runs on the UI thread, costs no React renders. */
  float?: boolean;
  /** Render one frame and stop. Use for lists, pickers and thumbnails. */
  still?: boolean;
  /** Set false for decorative companion shapes that should read as objects, not characters. */
  eyes?: boolean;
  /**
   * Frame cap for the geometry loop. Each frame re-renders the SVG tree in
   * React, so this is the main cost knob. 30 is imperceptible for the subtle
   * idle motion; raise it only for a single hero avatar.
   */
  fps?: number;
  /** Announced by screen readers, e.g. "Research Scout, blue". */
  label?: string;
};

function DotAvatarComponent({
  definition,
  animation = "idle",
  size = 200,
  glossy = true,
  float = true,
  still = false,
  eyes = true,
  fps = 30,
  label,
}: Props) {
  const reduceMotion = useReducedMotion();
  // Under Reduce Motion the avatar settles on a single frame: no loop, no bob.
  const frozen = still || reduceMotion;

  const def = useMemo(() => {
    const v = validateAvatarDefinition(definition);
    if (!v.ok) {
      console.warn(`[DotAvatar] invalid definition: ${v.errors[0]?.message}`);
      return null;
    }
    return v.value as AvatarDefinition;
  }, [definition]);

  const env = useMemo(
    () => ({ random: Math.random, reduceMotion }),
    [reduceMotion],
  );

  const uid = useId().replace(/:/g, "");
  const clipId = `dot-head-${uid}`;
  const gradId = `dot-grad-${uid}`;
  const glowId = `dot-glow-${uid}`;
  const shadowId = `dot-shadow-${uid}`;

  const state = useRef<ReturnType<typeof advanceAvatarPlayback> | null>(null);
  const [scene, setScene] = useState<ReturnType<typeof renderAvatarFrame> | null>(
    null,
  );

  // Bootstrap playback, and switch animation smoothly from whatever frame is
  // already on screen. Runs before paint so there is no empty first frame.
  // The ref is only ever touched here, never during render.
  useLayoutEffect(() => {
    if (!def) return;
    const t = now();
    const from = state.current
      ? sampleAvatarFrame(def, state.current, t, env)
      : undefined;
    const next = playAvatarAnimation(def, animation, t, from);
    if (!next.ok) {
      console.warn(`[DotAvatar] ${next.error.message}`);
      return;
    }
    state.current = next.value;
    setScene(renderAvatarFrame(def, next.value, t, env));
  }, [animation, def, env]);

  // Geometry loop. One state update per frame, capped to `fps`.
  useEffect(() => {
    if (!def || frozen) return;
    const minDelta = 1000 / Math.max(1, fps);
    let raf = 0;
    let last = 0;
    // Must use the same clock the bootstrap used. The timestamp handed to a
    // requestAnimationFrame callback comes from a different epoch than
    // performance.now(), and mixing them makes playback jump by the epoch
    // difference and settle into an empty frame.
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = now();
      if (t - last < minDelta) return;
      last = t;
      if (!state.current) return;
      state.current = advanceAvatarPlayback(def, state.current, t, env);
      setScene(renderAvatarFrame(def, state.current, t, env));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [def, env, fps, frozen]);

  // Float: a single shared value on the UI thread drives both layers.
  const bob = useSharedValue(0);
  const floating = float && !frozen;
  useEffect(() => {
    if (!floating) {
      bob.value = withTiming(0, { duration: 200 });
      return;
    }
    bob.value = withRepeat(
      withTiming(1, {
        duration: FLOAT_PERIOD_MS / 2,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [bob, floating]);

  const scale = size / 300; // viewBox is 300 units wide
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * FLOAT_LIFT * scale }],
  }));
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 1 - bob.value * 0.3,
    transform: [{ scaleX: 1 - bob.value * 0.14 }],
  }));

  const a11y = label
    ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel: label }
    : { accessible: false, importantForAccessibility: "no-hide-descendants" as const };

  if (!def || !scene) {
    // One render before useLayoutEffect commits the first frame, and the
    // permanent state for an invalid definition. Reserve the space either way
    // so nothing reflows.
    return <View style={{ width: size, height: size }} {...a11y} />;
  }

  const { geometry: g, colors } = scene;
  const body = glossy ? `url(#${gradId})` : colors.body;

  return (
    <View style={{ width: size, height: size }} {...a11y}>
      {glossy && (
        <Animated.View
          pointerEvents="none"
          style={[{ position: "absolute", inset: 0 }, shadowStyle]}
        >
          <Svg width={size} height={size} viewBox="-150 -150 300 300">
            <Defs>
              <RadialGradient id={shadowId} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={shade(colors.body, -0.5)} stopOpacity={0.35} />
                <Stop offset="1" stopColor={shade(colors.body, -0.5)} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={0} cy={132} rx={95} ry={12} fill={`url(#${shadowId})`} />
          </Svg>
        </Animated.View>
      )}

      <Animated.View
        pointerEvents="none"
        style={[{ position: "absolute", inset: 0 }, bodyStyle]}
      >
        <Svg width={size} height={size} viewBox="-150 -150 300 300">
          <Defs>
            <ClipPath id={clipId}>
              <Path d={g.headPath} />
            </ClipPath>
            <RadialGradient
              id={gradId}
              cx={-55}
              cy={-70}
              r={230}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={shade(colors.body, 0.45)} />
              <Stop offset="0.45" stopColor={colors.body} />
              <Stop offset="1" stopColor={shade(colors.body, -0.35)} />
            </RadialGradient>
            <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {g.backPaths.map((d, i) => (
            <Path key={`b${i}`} d={d} fill={body} />
          ))}
          <Path d={g.headPath} fill={body} />

          {glossy && (
            <G clipPath={`url(#${clipId})`}>
              <Ellipse
                cx={-48}
                cy={-72}
                rx={52}
                ry={30}
                fill={`url(#${glowId})`}
                transform="rotate(-25 -48 -72)"
              />
            </G>
          )}

          {eyes && (
            <G clipPath={`url(#${clipId})`} fill={colors.eyes}>
              <Path d={g.leftPath} opacity={g.leftVisible ? 1 : 0} />
              <Path d={g.rightPath} opacity={g.rightVisible ? 1 : 0} />
            </G>
          )}

          {g.frontPaths.map((d, i) => (
            <Path key={`f${i}`} d={d} fill={body} />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

export const DotAvatar = memo(DotAvatarComponent);
