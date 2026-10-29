import base from "@/assets/dot.avatar.json";
import { DotAvatar } from "@/components/dots/dot-avatar";
import { withLook } from "@/components/dots/dotLooks";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

const HERO = 232;
const BOX = 300;

/**
 * Welcome visual anchor: the live Dot with two decorative companion shapes.
 * The ring drifts slowly so the hero is never completely static; everything
 * settles immediately under Reduce Motion.
 */
export function WelcomeHero() {
  const reduceMotion = useReducedMotion();
  const purpleSquare = useMemo(() => withLook(base, "square", "purple"), []);
  const cyanTriangle = useMemo(() => withLook(base, "triangle", "cyan"), []);

  const drift = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + drift.value * 0.2,
    transform: [{ rotate: `${-14 + drift.value * 5}deg` }],
  }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Dot, a blue character, with two small companion shapes"
      className="items-center justify-center"
      style={{ width: BOX, height: BOX }}
    >
      {/* soft ambient glow */}
      <Svg width={BOX} height={BOX} style={{ position: "absolute" }} pointerEvents="none">
        <Defs>
          <RadialGradient id="welcome-glow" cx="50%" cy="48%" r="50%">
            <Stop offset="0" stopColor="#0268fe" stopOpacity={0.14} />
            <Stop offset="1" stopColor="#0268fe" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={BOX / 2} cy={BOX * 0.48} rx={BOX / 2} ry={BOX * 0.42} fill="url(#welcome-glow)" />
      </Svg>

      {/* orbit ring */}
      <Animated.View
        pointerEvents="none"
        style={[{ position: "absolute", width: BOX, height: BOX }, ringStyle]}
      >
        <Svg width={BOX} height={BOX}>
          <Ellipse
            cx={BOX / 2}
            cy={BOX * 0.56}
            rx={BOX * 0.44}
            ry={BOX * 0.17}
            stroke="#8fc0ff"
            strokeWidth={2}
            fill="none"
          />
        </Svg>
      </Animated.View>

      <DotAvatar definition={base} animation="idle" size={HERO} fps={60} />

      <View pointerEvents="none" style={{ position: "absolute", left: 6, top: 18 }}>
        <DotAvatar definition={purpleSquare} size={74} still eyes={false} float={false} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", right: 0, top: 34 }}>
        <DotAvatar definition={cyanTriangle} size={70} still eyes={false} float={false} />
      </View>
    </View>
  );
}
