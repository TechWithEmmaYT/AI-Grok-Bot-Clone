# Mobile Design — Dot

Status: Draft
Last updated: 2026-10-11

Companion to [Dot — Implementation Plan](../plans/2026-10-11-dot-agent-app.md), which owns scope, data model and delivery. This document owns the experience. Implementation-neutral: any Expo/RN, SwiftUI, Compose or Flutter agent can consume it.

## Product

Individual power users create **Dots** — small, named, visually distinct AI agents, each with its own instructions and toolset. Dots research, browse live sites, act in connected apps and drive a remote desktop, in chat and on a schedule. iOS and Android, portrait, phone only.

**Activation moment:** the first time a Dot's step timeline streams real tool work — `Searching with Treg · found 18 sources` — and returns a result with sources. Everything before that is setup.

**Locked:** the 16 screens in `_designs/` define the structure. Four tabs (Home / Tasks / Connections / You). One chat per Dot. Light-first. The 3D blob mascot is the product's identity.
**Excluded:** paywall, pricing, trial, pledge/oath, personalization funnel — v1 has no billing, so onboarding stays welcome → register → create first Dot. No run sharing. No web layout.

## Direction

Calm, bright, physical. Flat near-white UI with hairline borders and almost no elevation, carrying one piece of tactile 3D artwork — the Dot — as the sole source of warmth. Dense agent data (timelines, run history, sources) stays quiet and scannable; the mascot and the live tool views are the only things that move.

**Background:** plain. `#FFFFFF` throughout, tinted surfaces for grouping. No gradient anywhere in the UI — all gradient lives inside the mascot renders and the embedded live views.

**Colour** — values sampled from `_designs/`, not estimated:

| Role | Light | Note |
|---|---|---|
| `background` | `#FFFFFF` | |
| `surface` | `#F5F7FB` | inputs, grouped cards, quick-action tiles |
| `border` | `#E8EDF5` | hairline, 1px |
| `foreground` | `#111111` | headings, primary CTA fill |
| `muted-foreground` | `#78809B` | meta, timestamps, step detail |
| `primary` | `#0268FE` | active tab, toggles, links, FAB |
| `primary-tint` | `#E1EAFF` | active pill, "Create a new Dot" button |
| `success` | `#00C755` | completed steps and runs |
| `success-tint` | `#DEF8EC` | completed-run banner |
| `attention` | `#FE7B0F` | **approvals only** |
| `attention-tint` | `#FFF2E6` | |
| `destructive` | `#FF3B30` | pause/disconnect — *chosen, not sampled* |
| `canvas-dark` | `#070A18` | embedded browser and desktop surfaces |

**Dot identity colours** (8, from the picker row): blue `#0268FE` · purple `#A246F9` · pink `#FD469F` · orange `#FE7B0F` · yellow `#FDC201` · green `#39C48F` · cyan `#13D1DB` · white `#E7EBF2`. These are artwork colours and never style chrome; they live in `src/components/dots/dotLooks.ts`, not in `global.css`. `success #00C755` is deliberately distinct from the green Dot so a green Dot never reads as a status.

**Dot shapes** (8, as implemented in `dotLooks.ts`): `blob` (primary) · `cloud` · `square` · `triangle` · `clover` · `gem` · `egg` · `capsule`. They are procedural surface definitions swapped onto one base avatar JSON, so every shape inherits every animation — there is no per-shape artwork to generate.

Dark theme: invert neutrals (`#0C0E14` background, `#161922` surface, `#242836` border, `#F4F6FA` foreground), hold `primary`, `success` and all eight Dot colours unchanged, deepen tints to ~14% alpha of their hue.

**Typography** — Inter variable. Display 34/800/-2% · Screen title 28/800/-2% · Section 17/700 · Card title 17/700 · Body 16/400 · Secondary 14/400 muted · Label & pill 13/600. Tabular figures for durations, times, counts and run timestamps so timeline columns align.

**Spacing & shape** — 4pt rhythm. Gutter 20 · card padding 16 · card gap 12 · section gap 28. Radii: card 16 · tile 16 · input 14 · icon tile 12 · button pill 28 · chip and swatch 999. Borders do the grouping work; the only shadows in the product are the Tasks FAB and the chat composer bar.

**Icons** — SF Symbols via `expo-symbols` on iOS, matched outline set on Android, 1.75 stroke. No emoji as interface icons; the 👋 in the chat greeting is copy, not an icon.

**Motion** — content moves, screens do not. Timeline rows stagger in 40ms apart; the active step runs a 1.2s rotating arc; result cards fade and rise 8px; the approval card slides in with one 600ms attention-tint pulse, never repeating; the desktop control badge crossfades on mode change. Haptics only on approve/reject, takeover/hand-back, and run completion. Reduce Motion: final state immediately, spinners become a static arc, no stagger, no pulse — status stays legible in text.

**Accessibility** — 4.5:1 minimum on all text; `muted-foreground` on `surface` is the tightest pair and passes. Never encode state in colour alone: completed steps carry a check glyph, approvals carry a label, the selected swatch carries a ring plus inner dot. Minimum target 44pt. Full Dynamic Type to XXL — timeline and run rows wrap rather than truncate. Every Dot avatar needs an accessible name ("Research Scout, blue").

## Screen inventory

Four tab roots: **Home**, **Tasks**, **Connections**, **You**.

**Onboarding** (no personalization funnel — three screens, then the product)

1. **Welcome** — mascot hero, "Meet Dot", three capability chips (Research anything / Browse the web / Take action for you), black "Get started", text "I already have an account", Skip top-right.
2. **Create account** — Google, Apple, divider, email field, black "Continue", Terms/Privacy footnote.
3. **Sign in** — same frame as 2, no Terms footnote. *Not in `_designs`; mirrors register.*
4. **Create your first Dot** — 4-dot progress, live mascot preview, shape row (8), colour row (8), name field defaulting to "Dot", black "Create Dot". → Answer changes: shape, colour and name carry into Home, every chat header and every task row.

**Home**

5. **Dots — populated** — "Dots" display title, search and `+` icons, filter pills (All / Active / Scheduled / Archived), Dot rows with avatar, name, last-message preview and relative time, then a mascot-trio promo card with "Create a new Dot".
6. **Dots — empty** — mascot trio, "Create your first Dot", one primary action. No promo card, no filters.
7. **Dots — search active** — field replaces the title row, results filter live, empty result states as "No Dots match 'inbox'".

**Dot creation**

8. **Create a new Dot** — two choice cards (Create from scratch / Use a template), then "Popular templates": Research Scout, Inbox Manager, Job Hunter, Content Researcher, Executive Assistant.
9. **Customize your Dot** — as screen 4 plus carousel arrows flanking the preview and a clearable name field pre-filled from the template.
10. **Set up your Dot** — template summary card, editable multiline Instructions, then **Tools** as labelled toggle rows (Treg Research, Web Browser, Gmail, Calendar, GitHub). A tool whose connection is missing shows "Connect first" in place of the toggle and routes to Connections. Black "Create Dot".
11. **Dot is ready** — celebration, "<Name> is ready!", four green checklist rows (character, instructions, tools enabled with names, ready to chat), black "Start chatting", outline "View in Home", close top-right.

**Chat** — one persistent conversation per Dot. Header: back, avatar, name, subtitle, ⋯. Composer: "Ask me anything…", mic, send, `+`.

12. **Chat — greeting** — large mascot, "Hi <Name> 👋", "What would you like me to do today?", six tinted quick-action tiles (Research anything, Browse the web, Take action for you, Analyze files, Use your apps, Create a task).
13. **Chat — working** — user bubble in `primary` with white text; below it a collapsible "<Dot> is working on it…" panel of step rows: tinted icon tile, title, detail, and a trailing state glyph (green check done · rotating arc active · grey dot pending). Connector line links the tiles.
14. **Chat — result** — short lead-in bubble, then a result card: title, subtitle, numbered rows with favicon, name, description and chevron; actions "View full comparison" and "View sources"; feedback row (up, down, copy, ⋯).
15. **Chat — live browser** — "Browser" card header with a `Live` success pill, dark `canvas-dark` viewport showing the page, and a compact step list beneath it.
16. **Chat — approval required** — *new, expanded below.*
17. **Chat — approval resolved** — the card collapses to a single timeline row: green check "Approved · email sent to maya@…", or muted "Rejected · run stopped", or muted "Expired after 24h".
18. **Desktop — watching** / 19. **Desktop — you're in control** — *new, expanded below.*

**Tasks**

20. **Tasks list** — "Tasks" title, subtitle, blue `+` FAB, segment (Scheduled / Running / Completed), rows with Dot avatar, task name, Dot name, cadence, enable toggle and ⋯.
21. **Create a new task** — progress dots, horizontal Dot picker with "See all", "What should this task do?" multiline, capability chips reflecting the chosen Dot's tools, Schedule group (cadence / time / timezone), black "Create task".
22. **Task detail** — header with avatar, name, Dot, master toggle, Edit and ⋯; summary card (cadence + next run, tools, instruction); tabs (Recent runs / Settings / Tools / History); run rows with status dot, timestamp and duration; "Run now" and "Pause".
23. **Run detail** — `Completed` success pill, title, timestamp and duration, vertical step timeline with per-step times, then tabs (Summary / Sources (24) / Files) with the summary card below.
24. **Run detail — failed** — `Failed` destructive pill, the timeline stopping at the failed step with its error line, and "Retry run".

**Connections** *(no design in `_designs`; in v1 scope)*

25. **Connections** — "Your apps": Gmail, Calendar, GitHub, Sheets rows with logo, name, status line (connected account email or "Not connected") and Connect/Disconnect. Second group "Built-in tools": Treg Research, Web Browser, Desktop — described, always available, no action. Disconnecting warns which Dots lose a tool.

**You** *(no design in `_designs`; in v1 scope)*

26. **You** — avatar, name, email; **Usage this month** card with a horizontal meter and "34 of 100 runs", plus browser and desktop minutes; Appearance (System / Light / Dark); Notifications toggle; Sign out; Delete account.
27. **Quota reached** — a sheet, not a screen: mascot at rest, "You've used all 100 runs this month", the reset date, and "Got it". No upsell — there is nothing to sell in v1.

**Permission primers** — notifications after the first task is created ("So you know when a run finishes or needs you"), microphone on first mic tap. Each explains the benefit before the system prompt and continues on denial.

## Expanded: approval required (16)

The one moment the app interrupts. Inline in the chat timeline where the run paused, never a modal — arrival is usually from a push, and the surrounding context is what makes the decision judgeable.

Card on `attention-tint` with a 1px `attention` border, header pill "Needs your approval" with a bolt glyph — the same treatment as the "Take action for you" tile, so the colour is already part of the language. Body varies by gate:

- **Outbound comms** — To, Subject, first three lines of the body, "Show full message" expanding in place.
- **Payment** — merchant, line item, and the amount at Screen-title size.
- **App write** — target app, action verb, payload as label/value rows.

Footer: black "Approve", ghost "Reject", and `Expires in 23h` in muted text. Both actions take a full-width half each — no accidental-tap-sized targets on an irreversible send. On resolve, the card animates to its collapsed row (17) and the run resumes.

States: pending · approved · rejected · expired (muted, actions removed, "This run was stopped"). Arriving from a push scrolls the card into view with a single tint pulse.

## Expanded: desktop watching / control (18–19)

A 1280×800 desktop cannot be driven inside a chat bubble. Chat shows only a **preview card** matching the browser card (15) — header "Desktop", `Live` pill, dark viewport, "Open desktop" — which opens a full-screen view.

Full-screen `canvas-dark`, landscape-preferred with a rotate hint on first open. Top bar: close, Dot avatar and name, mode badge. Desktop frame letterboxed and centred; pinch-zoom, pan, and double-tap to fit in both modes — a desktop checkbox is untappable at phone scale otherwise.

**Watching** (default) — badge `Live` in success; a soft ring marks each agent click as it lands; a caption strip narrates the current step ("Opening pricing page…"); touch pans and zooms only; bottom-right "Take over".

**You're in control** — the agent is **paused**: badge switches to `You're in control` in attention, caption reads "Dot is paused — hand back when you're done", button becomes "Hand back". Touch maps to click and drag; a keyboard button raises the soft keyboard. All three carry the mode, so losing any one still leaves it unambiguous — both parties acting at once is the failure to design out.

States: connecting (skeleton, "Starting desktop…") · live · controlling · reconnecting (dimmed last frame, retry) · ended (dimmed final frame, "Desktop closed", Done).

## Components and states

Shared: Dot avatar (8 shapes × 8 colours, 5 sizes) · filter pill and segmented control · tool toggle row · status pill (success / attention / destructive / muted) · step row · result card · tinted quick-action tile · black primary button · outline secondary · ghost tertiary · bottom tab bar.

Every list needs loading (skeleton rows, never spinners), populated, empty and error. Every destructive action (delete Dot, disconnect app, delete account) confirms in a sheet naming the consequence. Offline: cached Dots, tasks and runs stay readable with a top banner; composer and Run now disable.

## Assets

The mascot exists only inside the reference PNGs and must be produced as a real asset set: **8 shapes × 8 colours = 64 transparent PNGs**, 512×512 @3x, plus three multi-Dot scenes.

Shared style lock: *Soft-body 3D character, glossy translucent resin with subtle subsurface glow, two rounded vertical white eye slits, gentle squash-and-stretch proportions, soft top-left key light with a faint rim, small blurred contact shadow, no mouth, no limbs, centred, transparent background.*

```text
<Shared style lock>. Create dot-<shape>-<colour>.png: a single <shape>
character in <hex>, calm neutral expression, facing viewer, upright at rest.
Centred with 8% padding. Transparent background. 1:1, 512x512.
No text, logo, watermark, UI controls, or extra limbs.
```

Shapes: `blob` (primary), `round`, `square`, `triangle`, `clover`, `hexagon`, `droplet`, `star`. Scenes: `scene-welcome` (single blue blob, small violet and teal companions, confetti shards), `scene-trio` (blue blob with orange and mint companions, for the Home promo and empty state), `scene-celebrate` (blue blob with confetti, for Dot ready). Motion is optional and post-approval: a 2s seamless idle-breathing loop of `dot-blob-blue` at 512×512, used only on Welcome.

Also needed: app icon and splash from `dot-blob-blue` via `expo-app-assets`; provider logos (Google, Apple, Gmail, Calendar, GitHub, Sheets) from official brand kits, unmodified.

## Representative data

Shown for completeness, all to be replaced by live data: Dot names and templates (Research Scout, Inbox Manager, Job Hunter, Content Researcher, Executive Assistant) · task names (Morning AI Brief, Inbox Cleanup, Find New Jobs, Weekly Team Update, Content Research) · cadences and run durations (`Completed in 4m 12s`) · source counts (`Found 18 recent sources`, `Sources (24)`) · the greeting name · usage figures (`34 of 100 runs`).

Two things must be corrected rather than merely replaced: the result card in `single-dot-screen-3.png` lists **"Claude 3.5 Sonnet"**, which is long out of date — representative tool comparisons should name current models (Claude Opus 5.5, Sonnet 5.5). And every product logo, ranking and price inside a result card is third-party content fetched at runtime, never bundled.

## Board prompt and review

Not generated. Both image MCP servers (`diffusion`, `mockup-studio`) failed to connect this session, so no board can be produced here. Prompts below are copy-ready for an external generator.

**Shared block** — prepend to each board:

```text
Create a high-resolution mobile UI board for Dot, an iOS/Android app where people
build small AI agents ("Dots") that research, browse, act in connected apps and
drive a desktop, in chat and on a schedule. Audience: individual power users.

VISUAL DIRECTION
Calm, bright, physical. Pure white #FFFFFF backgrounds, grouped surfaces #F5F7FB,
1px #E8EDF5 hairline borders, near-zero elevation. Text #111111, secondary #78809B.
Primary blue #0268FE with #E1EAFF tint pills. Success #00C755, attention orange
#FE7B0F with #FFF2E6 tint. Embedded live views on near-black #070A18. No gradients
in the UI. Inter: display 34px/800 tight, titles 28px/800, section and card titles
17px/700, body 16px/400, meta 14px, labels 13px/600, tabular figures.
4pt spacing, 20px gutters, 16px card radius, 28px pill buttons, 12px icon tiles.
Primary buttons are solid near-black pills with white text.
The mascot is a glossy translucent 3D soft-body blob with two white vertical eye
slits, soft key light and a small contact shadow, in blue #0268FE, violet #A246F9,
pink #FD469F, orange #FE7B0F, yellow #FDC201, mint #39C48F or teal #13D1DB.
Portrait iPhone frames, consistent device framing, flow order left to right.
Realistic specific content, never Lorem ipsum, never the words sample/demo/
placeholder/mock in the UI. No copied third-party branding beyond plain provider
logos. Everything legible at board scale.
```

**Board 1 — Onboarding and creation** (8, 4×2): Welcome · Create account · Create your first Dot · Create a new Dot (template list) · Customize your Dot · Set up your Dot (instructions + tool toggles) · Dot is ready · Dots home populated.

**Board 2 — Chat and agent work** (8, 4×2): Chat greeting with six tinted quick-action tiles · Chat working with a five-row step timeline · Chat result card ranking four AI coding tools · Chat live browser on dark canvas · Approval required card (send email, orange tint, Approve/Reject) · Approval resolved as a green collapsed row · Desktop watching (dark, `Live` badge, caption strip, "Take over") · Desktop you're in control (orange badge, "Hand back", soft keyboard button).

**Board 3 — Tasks and account** (8, 4×2): Tasks list with six scheduled rows and toggles · Create a new task · Task detail with recent runs · Run detail with timeline and summary · Run detail failed · Connections · You with a usage meter · Dots home empty state.

## Open decisions

- `destructive #FF3B30` is chosen, not sampled from `_designs` — confirm against the Pause button in `task-new-2.png`.
- Dark theme values are derived, not designed. Needs one review pass on the chat and desktop screens, where `canvas-dark` and the dark theme surface sit adjacent.
- Desktop takeover assumes landscape. If it must work in portrait, the control affordances need rework, not just reflow.
- 64 mascot renders is a large generation set. A smaller launch set (blob in all 8 colours, plus the other 7 shapes in blue) covers every screen in `_designs` if budget is tight.
