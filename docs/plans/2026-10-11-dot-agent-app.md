# Dot — Implementation Plan

**Status:** approved, not started
**Created:** 2026-10-11

Source of truth for scope, data model, and delivery decisions. Read this before planning or implementing any feature. When a decision here turns out to be wrong, change this file rather than diverging from it silently.

---

## 1. Product

**Dot** is a mobile app for creating small, named, visually distinct AI agents — "Dots". Each Dot has its own instructions and its own enabled toolset. Dots research the web, browse live sites, act inside connected apps, and drive a remote desktop. They work in chat and on a schedule, and report back with a step-by-step timeline of what they actually did.

**Primary user:** an individual power user who wants recurring agent work — a morning research brief, inbox triage, job hunting — without writing automation.

**v1 success:** a user signs up, creates a Dot from a template, chats with it while real tool steps stream in, schedules it, and receives a completed run with a summary and sources — surviving an app backgrounding or a cold start mid-run.

**End goal:** a YouTube teaching build. The repo is the artifact. Optimize for legible code and a followable build order. No App Store submission, no Google OAuth verification, no billing.

### In scope for v1

Onboarding and auth · Dot creation (from scratch and from 5 templates) with shape, color, name, instructions and per-Dot tool toggles · one persistent chat per Dot with a live step timeline · Treg research · Browserbase live browsing · Composio connections (Gmail, Calendar, GitHub, Sheets) · E2B Desktop with live view and takeover · human approval gates · scheduled tasks with run history and per-run timelines · file attachments · voice input · search and archive · push notifications · usage metering with hard caps.

### Explicitly out of scope

Run sharing and public run pages · billing of any kind · teams, sharing, or multi-user Dots · web as a product surface (the web target exists only to host API routes) · multiple conversation threads per Dot.

---

## 2. Confirmed decisions

| Decision           | Choice                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Name               | **Dot** — slug `dot`, scheme `dot://`, replacing `grok-bot-mobile-app`                      |
| App                | Expo SDK 57, React Native 0.86, React 19, Expo Router in `src/app/`, typed routes           |
| Styling            | Uniwind + Tailwind v4, semantic light/dark tokens, Sonner Native toasts                     |
| Backend            | Expo Router API routes (`+api.ts`) deployed to EAS Hosting                                  |
| Auth               | Better Auth server instance in API routes, `@better-auth/expo` client, SecureStore sessions |
| Database           | Neon Postgres + Drizzle, one schema shared by app and server                                |
| Blob storage       | Cloudflare R2 (S3-compatible)                                                               |
| Agents             | Trigger.dev `chat.agent()` + AI SDK, `useTriggerChatTransport` feeding `useChat`            |
| Model              | `claude-opus-5-5` for agent turns, `claude-haiku-4-5` for titles and summaries              |
| Tools              | Treg (research), Browserbase (browsing), Composio (app connections), E2B Desktop (computer) |
| Vendor credentials | App-owned keys, metered per user, hard caps enforced server-side                            |
| Billing            | None in v1; metering schema built so billing drops in later without migration               |
| Approvals          | All three gates on: outbound comms, payments, writes to connected apps                      |
| Chat model         | One persistent chat per Dot; `chatId = dotId`                                               |
| Platforms          | iOS + Android development builds                                                            |

### Assumptions (defaults, still open to change)

1. **Cloudflare R2** for blobs — Neon has no object storage, R2 is S3-compatible with free egress.
2. **`expo-speech-recognition`** for voice input — on-device via native iOS Speech and Android SpeechRecognizer. No audio upload, no extra vendor.
3. **`expo-notifications` + EAS push** for run completion and approval alerts.
4. **Templates are seeded database rows**, not hardcoded constants, so they change without an app release.
5. **Single-user throughout.** No teams, no shared Dots, no org concept anywhere in the schema.
6. **Approval waitpoints expire after 24h** and mark the run failed rather than blocking forever.
7. **Run steps and sources are `jsonb`** on `task_run` rather than separate tables.
8. **Trigger.dev server-side compaction** handles long-lived per-Dot chats. No custom truncation.
9. **Google and Apple sign-in use the Better Auth browser flow**, not native ID-token SDKs.

---

## 3. Architecture

### The server actually exists

"No API routes" refers only to the streaming chat route, which `chat.agent` removes. A backend is still required, because minting Trigger.dev tokens client-side would expose the environment secret key, and Better Auth needs a server instance. Five routes total:

| Route                        | Purpose                         |
| ---------------------------- | ------------------------------- |
| `/api/auth/[...auth]`        | Better Auth handler             |
| `POST /api/chat/start`       | `chat.createStartSessionAction` |
| `POST /api/chat/token`       | `auth.createPublicToken`        |
| `GET /api/composio/callback` | Composio OAuth return           |
| `POST /api/push/register`    | store an Expo push token        |

### Message ownership — get this right early

Chat messages live in **Trigger.dev's durable session store**, not in Neon. Postgres holds only a denormalized last-message preview for the Home list. Duplicating message storage into Postgres is the obvious wrong turn; do not do it. The durability guarantee that makes chat survive refresh, deploy and crash belongs to Trigger.dev, and a second copy would drift from it.

### Model routing

- `claude-opus-5-5` — all agent turns. Strongest agentic tool-calling, 1M context, $4/$20 per MTok.
- `claude-haiku-4-5` — chat titles, run summaries, Dot name suggestions. $1/$5 per MTok.

Caches are model-scoped, so keep the split at a clean boundary: agent turns never touch Haiku, utility calls never touch Opus.

---

## 4. Data model

Flat ownership: every row is scoped to one `userId`. No roles, no sharing.

```
-- Better Auth owns these; generate them, do not hand-write
user, session, account, verification

dot
  id, user_id, name, shape, color, instructions,
  template_id?, status (active|archived), created_at, updated_at

dot_tool
  dot_id, tool_key (treg_research|web_browser|gmail|calendar|github|sheets|e2b_desktop),
  enabled
  -- composite PK (dot_id, tool_key)

template
  id, key, name, description, default_instructions,
  default_shape, default_color, default_tools (jsonb), sort_order
  -- seeded: research_scout, inbox_manager, job_hunter,
  --         content_researcher, executive_assistant

chat_session
  id, user_id, dot_id (unique), trigger_chat_id,
  last_message_preview, last_message_at
  -- one per Dot; messages themselves live in Trigger.dev

task
  id, user_id, dot_id, name, prompt, cron_expression, timezone,
  enabled, trigger_schedule_id, next_run_at, created_at

task_run
  id, task_id, user_id, trigger_run_id,
  status (running|completed|failed|skipped),
  started_at, finished_at, duration_ms, summary,
  steps (jsonb), sources (jsonb)

connection
  id, user_id, provider (gmail|calendar|github|sheets),
  composio_connected_account_id, status, connected_at

approval
  id, user_id, run_id?, chat_session_id?,
  kind (outbound_comms|payment|app_write),
  payload (jsonb), status (pending|approved|rejected|expired),
  trigger_waitpoint_token, created_at, expires_at, resolved_at

file
  id, user_id, dot_id?, run_id?, storage_key,
  filename, mime_type, size_bytes, created_at

usage_event
  id, user_id, run_id?, kind (model_tokens|treg_call|browserbase_minute|e2b_minute),
  quantity, cost_estimate_cents, created_at

user_quota
  user_id, period_start, runs_used, tokens_used,
  browser_minutes_used, desktop_minutes_used
```

Quotas are checked **before a run starts**, never after. A run that has already burned vendor spend cannot be un-burned.

---

## 5. Route map

```
src/app/
  (auth)/welcome            onboarding-welcome-screen.png
  (auth)/register           onboarding-register-screen.png
  (auth)/sign-in
  (onboarding)/create-dot   onboarding-create-dot-screen.png
  (tabs)/index              home-screen.png — Dots list
  (tabs)/tasks              tasks-screen.png
  (tabs)/connections
  (tabs)/you
  dot/new/index             dot-creation-flow-1.png — template picker
  dot/new/customize         dot-creation-flow-2.png
  dot/new/setup             dot-creation-flow-3.png — instructions + tools
  dot/new/ready             dot-creation-flow-4.png
  dot/[id]                  single-dot-screen-1..4.png — chat
  task/new                  task-new-screen.png
  task/[id]                 task-new-2.png — detail + recent runs
  run/[id]                  task-new-3.png — run timeline + summary
  api/auth/[...auth]+api.ts
  api/chat/start+api.ts
  api/chat/token+api.ts
  api/composio/callback+api.ts
  api/push/register+api.ts
```

Keep non-route code out of `src/app/`.

---

## 6. Trigger.dev task inventory

| Task               | Kind             | Role                                                           |
| ------------------ | ---------------- | -------------------------------------------------------------- |
| `dotChatAgent`     | `chat.agent`     | per-Dot conversational agent; owns tools, approvals, streaming |
| `scheduledDotTask` | `schedules.task` | cron firing, one per enabled `task` row                        |
| `runDotTask`       | `task`           | the agentic run a schedule triggers; writes `task_run`         |
| `summarizeRun`     | `task`           | Haiku pass producing the run summary card                      |

Tool definitions are declared on **both** `chat.agent({ tools })` and the `streamText` call. Declaring them only on `streamText` means `toModelOutput` runs on turn 1 and is dropped when history is re-converted on later turns.

Always take `streamText` from the run argument, never from the `ai` import. The imported one silently loses compaction, steering, background injection, the system prompt and telemetry.

---

## 7. Security rules

- No vendor key, Better Auth secret, or Trigger secret key in the client bundle. Only `EXPO_PUBLIC_` values cross that line.
- Tokens are minted exclusively through the two server actions.
- Every API route resolves the Better Auth session and scopes queries by that `userId`. Never trust a `userId` from the request body.
- Composio connected accounts are per-user OAuth. A user's Gmail tokens are never reachable from another user's run.
- Sanitize errors out of `uiMessageStreamOptions.onError` — the raw error leaks keys and stack traces.
- The quota check happens server-side before triggering, not in the app.

---

## 8. Build phases

Each phase ends at something demoable on camera. Done-when for every phase: `npx tsc --noEmit` clean, `npx expo lint` clean, verified on an iOS **and** an Android dev build.

Native modules (SecureStore, notifications, speech, audio) mean Expo Go stops working early. Move to `npx expo run:ios` / `run:android` or EAS development builds in phase 1.

### Phase 1 — Theme and shell

Load `expo-uniwind-theme`. Rename the app to Dot throughout `app.json` (slug, scheme, name). Uniwind + Tailwind v4, semantic tokens matching the designs' light palette, React Navigation color bridge, fonts, Sonner Native toaster, one `GestureHandlerRootView`. Build the 4-tab shell and static versions of every screen in `_designs`.

**Demo:** navigate the whole app, light and dark, nothing wired.

### Phase 2 — Auth and database

Neon project, Drizzle schema and migrations, Better Auth server instance in API routes, `@better-auth/expo` client with SecureStore. Email, Google and Apple via the browser flow. Protected vs public route groups with no pre-session flash. Onboarding create-first-Dot screen.

**Demo:** sign up, sign out, cold start restores the session.

### Phase 3 — Dots

Seed the 5 templates. Full creation flow across all four screens, from scratch and from template. Home list with real data and last-message preview, Dot detail header, edit and delete.

**Demo:** create a Research Scout from a template, see it on Home.

### Phase 4 — Chat

Load `trigger-getting-started`, then `trigger-authoring-chat-agent`. Install `@trigger.dev/sdk`, write `trigger.config.ts`, scaffold `/trigger`. Define `dotChatAgent` with the Dot's instructions as system prompt. The two server actions. `useTriggerChatTransport` into `useChat`. Step timeline component (`single-dot-screen-2.png`), markdown rendering, stop button forwarding `abortSignal`.

Add a crude per-user run counter here — not in phase 11. Vendor spend starts now.

**Demo:** chat with a Dot, background the app mid-stream, return and watch it continue.

### Phase 5 — Research and browsing

Treg research tool against `https://treg.to` — single `/call/` endpoint, app-owned token. Browserbase browsing tool with the live view embedded in chat (`single-dot-screen-4.png`). Rich result cards with ranked items and a sources list (`single-dot-screen-3.png`).

**Demo:** "compare the best AI coding tools this week" — real steps, real sources, live browser.

### Phase 6 — Connections

Composio per-user OAuth for Gmail, Calendar, GitHub, Sheets. Connections tab: connect, disconnect, status. Tools become available to a Dot only when the matching connection exists; the setup screen's toggles reflect that.

**Demo:** connect Gmail, ask the Inbox Manager to summarize unread mail.

### Phase 7 — Approvals and push

`expo-notifications` + EAS push, token registration. Trigger.dev waitpoints on all three gate kinds. Approval card in chat, approve/reject resuming the run, 24h expiry.

**This screen needs designing first** — run `/mobile-ui-design` against the existing visual language before building.

**Demo:** ask a Dot to send an email, get a push, approve from the card, watch it send.

### Phase 8 — Scheduled tasks

Task creation (`task-new-screen.png`) with Dot picker, prompt, cadence and timezone. `schedules.task` registration, enable/disable, run now, pause. Task detail with recent runs (`task-new-2.png`). Run detail with timeline, summary and sources (`task-new-3.png`). Haiku `summarizeRun`.

**Demo:** schedule a morning brief, run it now, read the result.

### Phase 9 — Files and voice

R2 bucket, presigned uploads, the composer `+` button, documents passed into the model, Files tab on a run. `expo-speech-recognition` behind the mic button with permission handling.

**Demo:** attach a PDF and ask about it; dictate a prompt.

### Phase 10 — E2B Desktop

**Highest-risk phase, no design coverage.** Design it first via `/mobile-ui-design`: streaming desktop frames to a ~390pt screen, plus an input-handoff model for user takeover, is a hard interaction problem. E2B Desktop sandbox lifecycle, frame streaming, takeover and hand-back, session teardown.

On the Claude API, Opus 5.5 does computer use **only** through `computer_toolset_20260801`; `computer_20251124` returns a 400 there. Verify the AI SDK Anthropic provider exposes that toolset version before building — if it does not, this phase is blocked and needs a direct Anthropic SDK path.

**Demo:** watch a Dot operate a desktop, take over mid-task, hand back.

### Phase 11 — Quotas and polish

Real `usage_event` writes across all four vendors, `user_quota` enforcement before run start, quota UI in the You tab. Home search and the All / Active / Scheduled / Archived filters. Empty, error and loading states. App icon and splash via `expo-app-assets`.

**Demo:** hit a cap and get a clean refusal instead of a surprise invoice.

---

## 9. Open risks

1. **E2B Desktop is the highest-risk item and has zero design coverage.** Mitigated by being last — the app is shippable without it.
2. **Approvals have no design either**, and three of the five templates cannot finish a run without passing a gate. The approval card is a core screen, not a nice-to-have.
3. **Treg and Composio overlap substantially.** Treg is a gateway to 3,800+ tools across 111 providers, which is Composio's job too. Revisit after phase 6, once both are in hand

4. **Vendor cost is uncapped until phase 11.** Opus 5.5 at $4/$20 per MTok, with browser screenshots burning vision tokens every step, adds up during development. The phase 4 run counter is the stopgap.
5. **EAS Hosting is young and it hosts auth.**
6. **`computer_toolset_20260801` support in the AI SDK Anthropic provider is unverified.** Phase 10 blocker.
7. **No timeline set.** Eleven phases is a substantial series. If a deadline appears, it should drive where the line gets drawn — phases 1–8 are a complete product.

---

## 10. Working rules

- Before touching Trigger.dev code, load the matching skill: `trigger-getting-started`, `trigger-authoring-tasks`, `trigger-authoring-chat-agent`, or `trigger-chat-agent-advanced`. The version-pinned reference ships inside `node_modules/@trigger.dev/sdk/skills/` and never drifts.
- Before touching Expo or React Native APIs, check the `expo` major in `package.json` and read the matching versioned docs. Do not answer from memory.
- Use `npx expo install <pkg>`, never a bare package-manager add.
- Screens come from `_designs/`. The structure is fixed; individual details may change where the design and the product disagree.
