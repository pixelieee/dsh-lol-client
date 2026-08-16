# Agent Note: League-of-Legends-client-style web frontend for DSH

Status: implemented

English | [中文](2026-08-16-lol-client-style-web-frontend.zh.md)

> Shipped as dynamic Cordis Plugin `lolc-1` (host-allocated id), Package
> `pkg-23` current (as of 2026-08-16; persisted source lives at
> `lol-client/client.js` beside this note tree). Package history: `pkg-1` and
> `pkg-2` failed client apply with `Cannot access 'CSS' before
> initialization` — the body's leading `return` left helper consts in the
> temporal dead zone; `pkg-3` defines all helpers before the final `return`
> and runs clean; `pkg-4` adds the queue-match flow (对局 tab), summoner
> level/XP footer, and a hextech sheen; `pkg-5` rebuilds the overlay as a
> faithful LCU skeleton (see Revision v2 below); `pkg-6` adds real Riot
> splash art with per-image `onError` letter-tile fallback; `pkg-7` (v4)
> moves navigation to a top horizontal bar, adds a full-bleed background
> splash, and a gold 对局 PLAY key; `pkg-16` (v5) windowifies the
> client (it previously was a full-screen `position:fixed; inset:0`
> `pointer-events:auto` overlay that covered the DSH conversation page and
> swallowed every click — reported as "每个按钮点击后没反应"), adds a Host
> half with the `lolc.probe.report` RPC + a model-callable `lolc_dom_report`
> dynamic Tool for screenshot-free DOM self-checks; `pkg-17` (v5.1)
> fixes the React error #310 render crash: the hook-bearing `Art` component
> was invoked as a bare function `Art({...})` inside the Champions/Store
> `Array.map()`, so its `useState` was counted against the caller's hook
> order — switching from home (1 Art) to champions (21 Arts) blew the hook
> count. All four call sites now use element form `el(Art, {...})`;
> `pkg-18` (v5.2) reworks interaction per live user feedback
> (window drag jumped/landed top-left half-visible, picking a champion was
> invisible outside the client, start-game did nothing visible, store/social
> felt pointless): drag now baselines on `getBoundingClientRect()` of
> `.lc-client` at pointerdown instead of the winOff-relative (0,0) offset
> and uses `setPointerCapture`; a persistent hero badge sits outside the
> window on the chat page; and the mapping to real sessions was fixed —
> `workspaces.startSession()` returns void and never opens the new session,
> so actions now set a pending flag and an `allIds` effect auto-opens the
> freshly created session via `sessions.open()`, workspace entry uses
> `connectWorkspace()` to obtain a SessionId, and every action surfaces a
> gold toast instead of silence; `pkg-19` (v5.3) fixes the next
> round of live feedback — "选择英雄后,弹窗来一个英雄框,还无法拖动": the
> champion card previously ran `startGame()` which auto-created and
> `sessions.open()`'d a fresh session (the "popup hero box" the user saw was
> DSH switching into the new session), AND the always-on bottom-left hero
> badge (z-index 22) sat ON TOP of the centered window when it was open,
> looking like an undraggable floating hero box. Champion cards now only
> select (toast + badge/play-page update); the hero badge renders only when
> the window is minimized; and drag gained an `onPointerCancel` fallback;
> `pkg-20` (v5.4) fixes "主对话页面还是没背景图" + "客户端的最小化
> 按钮也失灵": the titlebar's `setPointerCapture` retargeted the synthesized
> click to the header so the minimize button's `onClick` never fired (fix:
> `onTitleDown` bails when the target is inside a button), and the DSH
> home page now shows a body-level dark-splash wallpaper with a
> semi-transparent `--dsw-alias-bg-base` token; `pkg-21` (v5.5)
> removes the hero badge popup — user reported "点击最小化后,弹出来一个英雄
> 图片的窗口": minimizing actually worked (self-check shows winbtn→launcher
> flow), but the bottom-left hero badge (a fixed pill with 44 px splash
> avatar + name + tier added in v5.2/v5.3) popped up on minimization and
> read as "a hero-image window". Deleted the herobadge element and CSS; the
> picked champion now shows as plain text on the bottom-right launcher
> ('客户端 · 当前英雄 XX'), so minimizing leaves no image overlay.
> `pkg-22` (v5.6, current) makes the wallpaper actually visible: user then
> reported "不会弹出窗口了,但是背景是深色纯色" — the v5.4 body splash was
> hidden behind DSH's own opaque background tokens (`--dsw-alias-bg-layer-1`
> #0A1428, `layer-2` #101C30, `--dsw-specific-sidebar-fill` #010A13 stayed
> opaque in v5.4). All four bg tokens are now semi-transparent
> rgba(0.35-0.45), injected CSS forces `#root { background: transparent }`,
> and the wallpaper's darkening gradient was lightened to 0.35→0.85 so the
> Yasuo splash shows through while text stays readable.
> `pkg-23` (v5.7, current) addresses two findings: (1) "选完英雄后不会变" —
> the full-page wallpaper was hardcoded to Yasuo_0 in apply(); picking
> another champion changed nothing, so the wallpaper is now rendered by a
> React <style> element inside Lobby driven by heroChamp (picking a
> champion swaps the whole page background to that champion's 0-splash);
> the static background-image rule was removed from apply() to avoid two
> competing !important rules. (2) "主页大图看不到脸,太靠上被截断" — root
> cause: object-position: 50% 18% was set on the .lc-hero-art wrapper DIV,
> but object-fit/object-position only apply to replaced elements (img), so
> it was a no-op (image rendered with default 50/50 center crop, cutting
> the face); moved to .lc-hero-art .lc-artimg and raised the banner
> 320→360px.

## Revision v5.7 — Wallpaper follows picked champion; hero face crop fixed (pkg-23, 2026-08-16)

User: "不过选完英雄后不会变，而且客户端主页的『欢迎回来，召唤师』，里面的
图片还是有些看不到脸，图片太靠上了，被截断了"
- Wallpaper now follows the pick: the body background-image is no longer
  hardcoded Yasuo_0 in apply(); Lobby renders a React `<style>` element
  (wallpaperCss) keyed off heroChamp, so picking a champion immediately
  swaps the full-page background to that champion's official 0-splash with
  the same darkening gradient. The fixed-rule path in apply() keeps only
  background-color + #root transparent to avoid two competing !important
  background-image rules.
- Hero face crop: the 50% 18% object-position had been declared on the
  `.lc-hero-art` wrapper div — object-fit/object-position are inert on
  non-replaced elements, so the img was center-cropped (50/50) and the face
  (upper part of splash) was cut. Rule moved to `.lc-hero-art .lc-artimg`
  (the real img); hero banner raised 320→360px for breathing room.
- Verification: update run-25 completed, `currentPackageId pkg-23`,
  Host/Client `waitingFor: []`, no diagnostics; source synced to
  `lol-client/client.js`.

## Revision v5.6 — Make the page wallpaper actually visible (pkg-22, 2026-08-16)

User: "可以，不会弹出窗口了，但是背景是深色纯色" — the overlay problem was
fixed, but the chat page still showed plain dark color instead of the
splash. Root cause: only `--dsw-alias-bg-base` was made semi-transparent in
v5.4; DSH's inner page layers still used the opaque dark tokens
(`--dsw-alias-bg-layer-1`/`-2` = #0A1428/#101C30, `--dsw-specific-sidebar-fill`
= #010A13), which completely covered the body wallpaper.
- Made all four background tokens translucent: bg-base rgba(1,10,19,0.4),
  layer-1 rgba(10,20,40,0.45), layer-2 rgba(16,28,48,0.38),
  sidebar rgba(1,10,19,0.35); overlay stays 0.9 for modal readability.
- Injected `#root { background: transparent !important; }` so no app-sheet
  color can block the body image.
- Lightened the wallpaper darkening gradient (0.35 → 0.6 → 0.85) so the
  splash is clearly visible while text remains readable.
- Window/launcher/minimize/no-herobadge behavior unchanged (v5.5).
- Verification: update run-24 completed, `currentPackageId pkg-22`,
  Host/Client `waitingFor: []`, no diagnostics; source synced to
  `lol-client/client.js`.

## Revision v5.5 — Remove the hero-badge popup after minimizing (pkg-21, 2026-08-16)

User: "背景还是回弹窗来一个英雄图片的窗口,这不对啊" — clarified via
question that a real overlay with a hero image pops up when clicking 最小化.
Self-check data proved the minimize button itself works (click on
`lc-winbtn` → reappear via `lc-launcher`), but after minimizing, the
bottom-left **hero badge** (herobadge: `position:fixed` pill, 44 px splash
avatar + champion name + tier, introduced in v5.2/v5.3 so the picked
champion stays visible on the chat page) rendered and looked exactly like
"a hero-image window popping out".
- Deleted the herobadge element from the closed-branch render and all its
  CSS rules (`.lc-herobadge*`).
- The picked champion is now plain text inside the bottom-right launcher:
  `客户端 · 当前英雄 XX` (still honors the earlier "selection must be visible
  outside the client" request without an image overlay).
- Chat-page background remains the v5.4 body-level dark splash wallpaper.
- Verification: update run-23 completed, `currentPackageId pkg-21`,
  Host/Client `waitingFor: []`, no diagnostics; client source synced to
  `lol-client/client.js`.

## Revision v5.4 — Page wallpaper + minimize button fix (pkg-20, 2026-08-16)

User report: "主对话页面还是没背景图" + "客户端的最小化按钮也失灵".
- **Minimize button dead**: the titlebar's `onTitleDown` calls
  `setPointerCapture` on the header. Pointer capture retargets all later
  pointer events (including the synthesized `click`) to the capture element,
  so the click landed on the header instead of the button and `onClick`
  never fired — while plain drags worked (self-check logs showed
  `tag:"HEADER" btn:false` clicks on the titlebar and a moving `winOff`).
  Fix: `onTitleDown` returns early when `e.target.closest('button')` is
  truthy, so the minimize key never starts a drag/capture.
- **No wallpaper on the DSH home page**: outside the window is the real DSH
  conversation page; its base color was overridden to opaque `#010A13`, so
  it looked flat black. Fix: `styles.insert` a body-level wallpaper (dark
  Yasuo 0 splash + darkening gradient, `background-attachment: fixed`) AND
  made the `--dsw-alias-bg-base` dark token semi-transparent
  `rgba(1,10,19,0.62)` so the DSH page layer lets the art show through while
  text stays readable under the gradient.
- Snapshot telemetry: `clicks` now included in the interval deps so the 2 s
  snapshot reflects recent click counts.
- Verification: update run-22 completed, `currentPackageId pkg-20`,
  Host/Client `waitingFor: []`, no diagnostics; client source synced to
  `lol-client/client.js`.

## Revision v5.3 — Champion pick no longer pops a session; badge only when minimized (pkg-19, 2026-08-16)

User report after v5.2: "选择英雄后，弹窗来一个英雄框，还无法拖动。。。" —
two stacked root causes: (1) champion card `onClick` was
`setHeroChamp(i) + startGame()`, and v5.2's startGame auto-opens the new
session (`pendingOpen` + `allIds` effect → `sessions.open()`), so clicking a
champion visibly switched DSH into a brand-new conversation — perceived as
"英雄框弹窗"; (2) the persistent hero badge (`position:fixed`, `z-index:22`,
bottom-left) rendered even while the window was open (centered,
94vw×92vh), overlapping the window's bottom-left corner like an
undraggable box.
- Champion cards now call only `pickChampion(i)` (`setHeroChamp` + toast
  「已选择 X —— 点「开始对局」出战」); starting a session happens only via
  the explicit 开始对局 / 对局 PLAY / 开始排位 / 购买并开始 buttons.
- The hero badge renders only under `view === 'closed'` (window minimized),
  so it never overlaps the open window; minimized + chat page still shows
  the picked champion per the earlier request.
- Drag: added `onPointerCancel` that clears `dragRef` (pointercancel safety).
- Verification: update run-21 completed, `currentPackageId pkg-19`,
  Host/Client `waitingFor: []`, no diagnostics; client source synced to
  `lol-client/client.js`.

## Revision v5.2 — Interaction fixes from live user testing (pkg-18, 2026-08-16)

User report after v5.1: "我想拖动客户端窗口，结果它在浏览器页面里乱跳，现在跑
到左上角去了，而且只显示一半" + "选了英雄不应该在对话页面也有英雄吗" + "开始
对局、上一局，也没反应；商城、社交，都没有实际意义，很多点完都没反应".
- **Drag**: the old `onTitleDown` used `winOff` (null → (0,0)) as baseline,
  so the window was positioned by the mouse delta from the *viewport
  origin*, making it jump to the top-left on first drag. Fixed: snapshot
  `getBoundingClientRect()` of `.lc-client` on pointerdown and add the
  pointer delta; `setPointerCapture` keeps moves tracking outside the
  titlebar.
- **Hero badge**: picking a champion changed only client-internal state;
  now a fixed pill outside the window (splash avatar + name + tier, bottom
  left, click → champion page) makes selection visible on the DSH page.
- **Real session actions**: discovery via `Service.listService` showed
  `workspaces.startSession(): void` (creates but never opens) and
  `workspaces.connectWorkspace(workspaceId): Promise<SessionId>`; so
  start-game now opens the newly created session automatically (pending flag
  + allIds effect → `sessions.open()`), workspace entry uses
  `connectWorkspace` then opens, and session entry uses `sessions.open(id)`.
  A gold toast (2.6 s) confirms every action.
- Verification: update run-20 completed, `currentPackageId pkg-18`,
  Host/Client `waitingFor: []`, no diagnostics; client source synced to
  `lol-client/client.js`.

## Revision v5.1 — Fix React #310 hook-count crash (pkg-17, 2026-08-16)

pkg-16 verified live (68 DOM self-check reports flowing), but the Slot then
crashed while rendering: `Minified React error #310` ("Rendered more hooks
than during the previous render"), stack `Art → Array.map → ChampionsPanel →
Lobby`. Root cause: `Art` owns a `React.useState` (broken-image fallback) yet
was called as a plain function inside the champion/store card `Array.map`.
In React a component called as a plain function is not a component boundary —
its hooks are attributed to the *calling* component's hook order. Home
renders exactly one `Art`; opening 英雄 renders 21 → hook count jumped → #310.
Fix: all four call sites (hero-art, playchamp, champ grid, store card) now
use `el(Art, {...})` so each `Art` is a real element with its own hook
context; switching panels no longer changes Lobby's hook sequence. Verified:
update run-19 completed, `currentPackageId pkg-17`, Host/Client
`waitingFor: []`, overlay occupant active again (priority -3), fresh DOM
self-check reports resumed (15 stored: `view:"lobby" tab:"home" total:4
running:1 wsCount:1`).
- **Lesson (generalized)**: any reusable component with hooks rendered inside
  a `.map()` or a conditional must be mounted via `el(Component, props)` —
  never called as a bare function inside another component's render.

## Revision v5 — Windowed client + DOM self-check (pkg-16, 2026-08-16)

User report after v4: "我看差不多了，但是每个按钮点击后没反应" — then the user
discovered "原来是客户端把对话主页遮住了". Root cause: v4's `.lc-client` was a
full-viewport `position: fixed; inset: 0` box with `pointer-events: auto`,
so the overlay covered the whole DSH conversation page and ate every click;
buttons appearing unresponsive were clicks landing on the dead full-screen
shell over the app underneath. Fix in `pkg-16`:

- **Windowed client**: `.lc-client` is now a centered floating window
  (`width: min(1140px, 94vw)`, `height: min(780px, 92vh)`, rounded, shadowed,
  gold-bordered); `.lc-slot` stays `pointer-events: none` so everything
  outside the window box clicks through to the DSH page, which stays visible
  and operable. Titlebar drags the window (pointer events), double-click
  recenters, the winbtn minimizes to the corner launcher. The v4 full-screen
  `.lc-bgimg`/`.lc-bgshade` layers were removed; the window carries its own
  dark base.
- **DOM self-check (replaces the impossible headless screenshot)**: every
  click hit (tag, class, button?, x/y) is captured via root `onClickCapture`
  and pushed with 2s state snapshots (view/tab/queue/stats/winOff/clicks)
  over the package-private RPC `lolc.probe.report` (`host.call` →
  `harness.handle`) to the new Host half, which keeps the last 200 reports
  and registers dynamic Tool `lolc_dom_report` — the model reads real
  interaction data without screenshots. Verified live: 68 stored reports,
  e.g. `view:"lobby", tab:"home", total:4, running:1, wsCount:1, winOff:null`.
- **Architecture note**: the plugin is no longer Client-only — the Host half
  is a single private RPC handler + one read-only Tool, still consuming no
  new Service.

## Revision v2 — LCU-faithful replica + real Riot assets (2026-08-16)

User feedback on v1 (pkg-4): "有点难看，而且和英雄联盟客户端区别很大，不是很像，
我想要那种很复刻的感觉" — the dashboard-style lobby read as a LoL-themed
dashboard, not the client itself. Decision: rebuild the overlay on the real
League Client skeleton instead of decorating a generic dashboard.

- **Skeleton (pkg-5)**: narrow 62 px left icon rail with SVG line icons
  (主页/对局/英雄/藏品/商城/战利品/设置; hover/active gold left-edge bar),
  thin dark titlebar (DEEPSEEK serif logo, 在线 pulse, version, min/close
  window controls), collapsible right social column (好友·对局中 = running
  sessions, 好友·离线 = stopped, 战队·工作区 = workspaces), bottom summoner
  bar (avatar, level derived from session count, XP bar, 蓝色精粹/点券, social
  toggle), Play page with ranked emblem (tier from total sessions) + queue
  cards + gold 开始排位 + the queue-match flow, restrained navy/gold palette,
  serif display headings (Palatino stack standing in for Beaufort).
- **Real assets (pkg-6)**: hero becomes a full-bleed champion splash with
  5-dot carousel; Champions page becomes a 21-champion pool (`CHAMPS` table,
  real names/roles); Store shows featured skins. All art from Riot's official
  versionless ddragon splash endpoint
  (`/cdn/img/champion/splash/<id>_<n>.jpg`). Every `<img>` carries `onError`:
  offline or CSP-blocked requests degrade to a navy gradient + first-letter
  tile, so the replica never breaks and needs no network guarantee.
- **Mapping**: 对局 = a real `workspaces.startSession()`; 战队 = workspaces;
  summoner level/tier/LP are derived from session counts — no fabricated
  business data; currencies are cosmetic chrome (labeled 蓝色精粹/点券).
- **Alternatives considered**: include real client UI screenshots as
  background images (rejected — heavy, brittle, licensing); inline all art as
  data-URIs (rejected — huge bundle, no offline win over CDN+fallback); keep
  the Unicode-glyph dashboard (rejected — that was the feedback).
- **Consequence**: the replica now starts from the real client's spatial
  grammar (rail → content → social → summoner bar) and is visually anchored
  by legitimate Riot artwork whenever the page is online; when offline it
  still renders a coherent client chrome. Verification for pkg-6: state
  `running`, `currentPackageId pkg-6`, Client `waitingFor: []`, and the live
  `shell.overlay` occupant `lol-client-lobby` active.

## Problem

DeepSeek Harness's Web GUI is utilitarian and visually generic: dark-styled
three-column frame, flat alias tokens, no product identity. The goal is a
web frontend page in the style of the *League of Legends client* (deep navy
base + gold hextech borders + left icon rail + top status bar + center card
panels) without regressing the shipped frame — session browsing, conversation,
tool cards, settings, and approvals all live in `ui-layout`'s AppFrame, and
the `root` slot catalog explicitly forbids registration there (a dynamic entry
would win the single seat and blank the page).

## Decision

The LoL-client frontend ships as a **dynamic Client-only Cordis plugin** that
rides two sanctioned extension seams and does not touch any single-seat slot:

1. **Theme override layer** — `ctx.theme.overrideTokens('lol-client', …)`
   covers all 13 alias tokens with a LoL hextech palette as `{ light, dark }`
   pairs (dark: `#010A13` base, gold `#C8AA6E`/`#785A28`, parchment text
   `#F0E6D2`; light: a readable parchment adaptation). The returned disposer
   is owned by `ctx.effect`, so stop/update/unload restores the previous
   theme exactly. Runtime validation rejects bare strings, so every value is
   a pair — the full-app recolor is instantly visible on apply.
2. **Additive frame-wide lobby** — one entry with fresh id `lol-client-lobby`
   registers into `shell.overlay` (list slot, `replaceRisk: none`), the one
   additive seat above every column. The entry renders a League-client-style
   lobby: top status bar, left icon rail (主页/对局/英雄/藏品/设置), hero
   panel, stat cards, "最近对局" and "我的工作区" panels fed by the slot's
   standard props (`useSessions`, `useWorkspaces`), a queue/play page, and a
   settings page. The 对局 tab runs an interactive queue match: 开始排位 →
   gold gauge (~2.6 s via the optional `timer` service) → 对局已找到 →
   `workspaces.startSession()` then the lobby minimizes, landing the user in
   the fresh session. The lobby is interactive because `.overlayLayer > *`
   restores pointer events to entry roots; the root wrapper keeps
   `pointer-events: none` so nothing outside the lobby blocks the app. A
   close/minimize control collapses to a floating gold launcher button, so
   ordinary harness work is never permanently covered. All React hooks live
   in the top-level `Lobby` component (plain-function sub-panels take no
   hooks), keeping the queue state machine rules-of-hooks safe.

Seam-triangle scope: the plugin is a **Consumer** of the theme-token and
`shell.overlay` contracts DSH already owns; it declares no new Service, does
not register into `root`/`sidebar`/`conversation`/`details`, and needs no
Host half (session/workspace data arrives via the slot standard kit, with
`ctx.get('sessions')`/`ctx.get('workspaces')` for its open/start actions).
"Model-visible ⟺ logged" holds trivially: nothing model-visible enters the
request path.

## Alternatives considered

**Take the `root` slot / replace AppFrame.** Rejected — the slot catalog says
"DO NOT register here"; the single seat would shadow `ui-layout`'s frame and
unmount every descendant seat, leaving only the lobby and no product.

**Register into `conversation` (the center column).** Rejected — that is the
session-maybe single seat; taking it replaces the hero and live conversation,
destroying the primary workflow.

**Fork / patch `apps/web` or `ui-layout` for a permanent reskin.** Rejected —
a dynamic plugin keeps the change scoped, reversible, and reviewable as one
Package; a static reskin would fight browser-snapshot CI and the
"plugins, not loop changes" rule.

**Host half exposing session data over RPC.** Rejected — `shell.overlay`'s
standard props already carry live `useSessions`/`useWorkspaces`; fetching
again through Host would duplicate a capability the Slot already provides.

## Consequences

The whole GUI is recolored the moment the plugin runs, and a faithful
LCU-skeleton client page is one click away (open by default, minimizable to a
corner launcher). The shipped frame and every seat underneath stay mounted and
usable; stopping the plugin (`cordis_stop`) removes the lobby and restores
the previous theme via the disposer chain. Verification evidence (pkg-6): run
state `running` with `currentPackageId pkg-6`, and the live `shell.overlay`
tree reports the occupant `lol-client-lobby` as active. The Plugin is dynamic
and process-local by nature — the source is persisted at `lol-client/client.js`
and a durable bundle/preset form of the same skin is a follow-up, not part
of this decision.