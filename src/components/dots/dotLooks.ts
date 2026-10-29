// Shapes + colors for the "Customize your Dot" screen.
// Swaps the body/colors of one base avatar JSON, so every look shares all the animations.

type Surface = {
  type: 'sphere' | 'cube' | 'capsule' | 'cone' | 'diamond';
  width: number;
  height: number;
  depth: number;
  roundness: number;
  tipRoundness?: number;
  baseRoundness?: number;
};
type Body = {
  primary: Surface;
  nodes: { surface: Surface; position: [number, number, number]; rotation: [number, number, number] }[];
};

const S = (type: Surface['type'], w: number, h: number, d: number, r = 1, extra: Partial<Surface> = {}): Surface => ({
  type, width: w, height: h, depth: d, roundness: r, ...extra,
});
const N = (surface: Surface, position: [number, number, number]) => ({
  surface, position, rotation: [0, 0, 0] as [number, number, number],
});

export const DOT_SHAPES = {
  blob: { primary: S('sphere', 210, 185, 190), nodes: [N(S('sphere', 175, 165, 170), [22, -20, -15]), N(S('sphere', 150, 130, 140), [-22, 30, -15])] },
  cloud: { primary: S('sphere', 210, 150, 160), nodes: [N(S('sphere', 100, 100, 100), [-45, -45, -10]), N(S('sphere', 110, 110, 110), [40, -50, -10])] },
  square: { primary: S('cube', 190, 190, 190, 0.8), nodes: [] },
  triangle: { primary: S('cone', 210, 190, 210, 0.8, { tipRoundness: 1, baseRoundness: 1 }), nodes: [] },
  clover: { primary: S('sphere', 120, 120, 120), nodes: [N(S('sphere', 115, 115, 115), [0, -58, -10]), N(S('sphere', 115, 115, 115), [0, 58, -10]), N(S('sphere', 115, 115, 115), [-58, 0, -10]), N(S('sphere', 115, 115, 115), [58, 0, -10])] },
  gem: { primary: S('diamond', 200, 210, 200, 0.7), nodes: [] },
  egg: { primary: S('sphere', 175, 215, 180), nodes: [] },
  capsule: { primary: S('capsule', 160, 220, 160, 1), nodes: [] },
} satisfies Record<string, Body>;

// Sampled from the reference designs in _designs/ — see docs/design/mobile-design.md.
// These are artwork colours; UI chrome tokens live in src/global.css.
export const DOT_COLORS = {
  blue: '#0268fe',
  purple: '#a246f9',
  pink: '#fd469f',
  orange: '#fe7b0f',
  yellow: '#fdc201',
  green: '#39c48f',
  cyan: '#13d1db',
  white: '#e7ebf2',
} as const;

export type DotShape = keyof typeof DOT_SHAPES;
export type DotColor = keyof typeof DOT_COLORS;

export function withLook<T extends object>(base: T, shape: DotShape = 'blob', color: DotColor = 'blue'): T {
  return {
    ...base,
    body: DOT_SHAPES[shape],
    colors: { body: DOT_COLORS[color], eyes: color === 'white' ? '#1b1f2a' : '#ffffff' },
  };
}
