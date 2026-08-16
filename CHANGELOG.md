# 变更日志 / Changelog

> lol-client（Dynamic Cordis Plugin `lolc-1`）版本演变记录。格式遵循
> [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)：
> 顶部为最新版本，按时间倒序；每条含背景（用户实测反馈）与修复要点。

## [5.7] — 2026-08-16（pkg-23）

**用户反馈**：选完英雄后不会变；主页"欢迎回来，召唤师"大图看不到脸，太靠上被截断。

### 修复

- **整页背景壁纸跟随所选英雄**：此前 body 壁纸在 `apply()` 中写死为
  Yasuo_0，选任何人都不变。现改为由 Lobby 内 React `<style>` 元素按
  `heroChamp` 渲染（`wallpaperCss`）——选哪个英雄，页面背景立即换成该英雄
  的官方 0 号原画（同一套暗化渐变）；`apply()` 中静态 background-image
  规则已删除，避免两条 !important 竞争。
- **主页 hero 大图头像被裁**：根因是 `.lc-hero-art` 上的
  `object-position: 50% 18%` 写在包裹 div 上，而 `object-fit`/
  `object-position` 只对替换元素（img）生效——规则从未起作用，图片一直用
  默认 50% 50% 居中裁剪，头像（位于画面上部）被切掉。修复：定位规则移到
  `.lc-hero-art .lc-artimg`（真正的 img），并把大图加高（320→360px）。

## [5.6] — 2026-08-16（pkg-22）

**用户反馈**：不会弹出窗口了，但是背景是深色纯色。

### 修复

- **壁纸被 DSH 内层不透明 token 盖住**：v5.4 只把最外层
  `--dsw-alias-bg-base` 改半透明，但 `--dsw-alias-bg-layer-1/2`
  （#0A1428/#101C30）与 `--dsw-specific-sidebar-fill`（#010A13）仍不透明，
  亚索原画完全透不出。修复：
  - 四个背景 token 全部半透明化（rgba 0.35~0.45）；
  - 注入 CSS 强制 `#root { background: transparent !important; }`；
  - 壁纸自身暗化渐变减轻（0.35→0.85），原画整页可见，文字仍可读。
- 窗口/启动器/最小化/无英雄浮层行为与 v5.5 一致。

## [5.5] — 2026-08-16（pkg-21）

**用户反馈**：点击最小化后，弹出来一个英雄图片的窗口，这不对。

### 修复

- 自检数据证明最小化本身工作正常（`lc-winbtn` → `lc-launcher` 点击流），
  但最小化后左下角会弹出 **herobadge 英雄徽章**（v5.2/v5.3 为在对话页显示
  所选英雄而加：固定浮层胶囊，44px 原画头像 + 名字 + 段位）——用户将其
  视为"弹出来的英雄图片窗口"。
- **删除 herobadge 元素与全部 CSS**；当前英雄改为纯文字并入右下角启动器
  （`客户端 · 当前英雄 XX`）。最小化后不再有图片浮层，对话页背景由 v5.4 的
  深色原画壁纸承担。

## [5.4] — 2026-08-16（pkg-20）

**用户反馈**：主对话页面还是没背景图；客户端的最小化按钮也失灵。

### 修复

- **最小化按钮失灵**：标题栏 `onTitleDown` 对 header 执行
  `setPointerCapture`，会把后续 pointer 事件（含合成 click）重定向到标题栏，
  于是点最小化按钮时 click 落在 header 而非 button，onClick 永不触发。
  自检快照证实：用户点标题栏记录 `tag:"HEADER" btn:false`，而 `winOff`
  一直在变（拖动正常、按钮点击丢失）。修复：`onTitleDown` 检测到目标在
  button 内（最小化键）时直接返回，不启动拖拽、不捕获指针。
- **主对话页面没有背景图**：窗口外露出 DSH 对话主页，底色被覆盖为纯黑
  `#010A13`。修复：① `styles.insert` 一条 **body 级壁纸**（深色英雄原画
  Yasuo 0 号 + 暗化渐变，`background-attachment: fixed`）；
  ② `--dsw-alias-bg-base`(dark) 改为半透明 `rgba(1,10,19,0.62)`，DSH
  页面层透出原画，渐变保证文字可读。
- 快照自检把 `clicks` 纳入 interval 依赖，2s 快照能反映最近点击数。

## [5.3] — 2026-08-16（pkg-19）

**用户反馈**：选择英雄后，弹窗来一个英雄框，还无法拖动。

### 修复

- 两层根因：
  1. 英雄卡点击 = `setHeroChamp(i) + startGame()`，而 v5.2 的 startGame
     会自动 `sessions.open()` 新会话——"弹窗英雄框"其实是 DSH 被切进刚
     创建的新会话界面；
  2. 左下角常驻英雄徽章（`position:fixed; z-index:22`）在窗口打开（居中
     94vw×92vh）时叠在窗口左下角之上，看似一个拖不动的英雄框。
- **修复**：① 英雄卡点击只选中英雄（更新徽章/对局页 + toast），不再自动
  开始对局；② 英雄徽章仅 `view === 'closed'`（窗口最小化）时渲染，窗口打开
  时不出现、不遮挡；③ 拖动增加 `onPointerCancel` 清理兜底。
- 选英雄后的落点：徽章（窗口关时）+ 对局页「已选择英雄」+ toast；真正
  「开始对局 / 对局 PLAY / 开始排位」才创建并切入新会话。

## [5.2] — 2026-08-16（pkg-18）

**用户反馈**：窗口拖动乱跳/跑左上角只显示一半；选英雄对话页看不到；开始
对局/上一局没反应；商城/社交点完没反应。

### 修复

- **拖拽重写**：此前拖动以 `winOff` 相对偏移为基准（首拖为 (0,0)），窗口被按
  "鼠标相对视口左上角的位移"定位，表现为乱跳、跑到左上角只剩一半。现按下时
  以 `.lc-client` 实际 `getBoundingClientRect()` 为基准叠加指针增量，并
  `setPointerCapture` 保证指针移出标题栏后事件不丢；双击标题栏复位居中。
- **对话页英雄徽章**：客户端窗口外常驻「当前英雄」胶囊（原画头像 + 名字 +
  段位，左下角），点击打开英雄页——选择在对话主页始终可见。
- **动作真正落到会话上**：查证 API 后发现 `workspaces.startSession()` 返回
  void 且**不打开**新建会话，所以"开始对局"之前只是无声创建。现改为：
  - 开始对局 / PLAY / 商城购买 → `startSession()` 后 `pendingOpen` 置位，
    `allIds` 快照 effect 检测到新会话 id 即自动 `sessions.open()` 切入 + toast；
  - 上一局 / 好友 / 藏品 / 战利品 → `sessions.open(id)` + toast；
  - 战队 / 工作区 → `workspaces.connectWorkspace(id)` 取得 SessionId 再打开
    + toast。
- **全动作 toast 反馈**：客户端顶部金色提示条（2.6s 自动消失），不再无声。

## [5.1] — pkg-17

**问题**：React error #310 渲染崩溃。

### 修复

- 带 hooks 的 `Art` 组件在英雄/商城卡的 `map()` 里被当作普通函数
  `Art({...})` 调用，其 `useState` 计入调用方组件的 hook 顺序——首页 1 个
  Art、切英雄页瞬间 21 个导致计数跳变。
- 4 处调用全部改为元素形式 `el(Art, {...})`，Art 成为独立组件边界。

## [5.0] — 2026-08-16（pkg-16，v5 窗口化 + DOM 自检）

**问题**：v4 `.lc-client` 为 `position:fixed; inset:0` 全屏遮罩 +
`pointer-events:auto`，把 DSH 对话主页整个盖住并吃掉所有点击——用户误以为
"每个按钮点击后没反应"。

### 修复

- **窗口化**：`.lc-client` 变为居中浮动窗口（`width: min(1140px, 94vw)`、
  `height: min(780px, 92vh)`、圆角 + 阴影 + 金色描边），`.lc-slot` 保持
  `pointer-events:none` 点击穿透——窗口外 DSH 对话页始终可见可操作，窗口内
  按钮恢复正常。窗口可拖动（标题栏 pointer 事件）、双击居中、最小化收为
  右下角「客户端」启动器。
- 移除 v4 的全屏背景层 `.lc-bgimg`/`.lc-bgshade`，窗口自带深色底。
- **DOM 自检（新能力）**：
  - Client 根元素 `onClickCapture` 记录每次点击命中（标签/类名/是否按钮/
    坐标），每 2s 上报状态快照（view/tab/queue/统计/窗口位置/最近点击）；
  - 经 Package 私有 RPC `lolc.probe.report`（`host.call` → `harness.handle`）
    送达 **Host 半**；Host 保留最近 200 条并注册动态 Tool `lolc_dom_report`，
    模型可直接调用——不依赖截图验证真实 UI 交互。

## [4.0] — pkg-7（v4）

- 顶部横排导航（从左侧图标栏改到顶部，匹配真客户端）。
- 全屏英雄原画背景 + 深色遮罩 + 半透明 backdrop-blur 面板。
- 顶栏右侧金色大「对局 PLAY」键一键 startSession。
- hero/卡片美术聚焦人脸（taller crops）。

## [3.0] — pkg-6

- 接入真实 Riot ddragon splash 原画：hero 轮播（5 点切换）、21 名英雄池、
  商城皮肤卡。
- 每个 `<img>` 带 `onError` 降级：加载失败（离线/CSP）显示「深蓝渐变 +
  英雄首字母」卡牌，界面不崩溃。

## [2.0] — pkg-5（LCU 复刻骨架）

- 窄图标栏（主页/对局/英雄/藏品/商城/战利品/设置）、深色标题栏 + 窗口控制、
  可收起右侧社交栏（会话=好友、工作区=战队）、底部召唤师条。
- 对局页：段位徽章 + 队列卡 + 金色开始按钮 + 匹配流程。

## [1.0] — pkg-3 / pkg-4

- pkg-3：修复 TDZ 求值顺序（此前 `Cannot access 'CSS' before
  initialization`），仪表盘风格首版运行干净。
- pkg-4：对局页排队匹配流、召唤师等级/经验页脚、hextech 微光。

## 附：Package 一览

| Package | 内容 | 状态 |
|---|---|---|
| pkg-1 / pkg-2 | 首版（主题 + 大厅） | ❌ client apply 失败（TDZ） |
| pkg-3 | 修复求值顺序 | ✅ 运行（v1 仪表盘风格） |
| pkg-4 | +排队流/召唤师页脚 | ✅ 运行 |
| pkg-5 | **LCU 复刻骨架** | ✅ 运行 |
| pkg-6 | +真实 Riot splash 素材 | ✅ 运行 |
| pkg-7 | v4：顶部横排导航 + 全屏原画背景 + 金色 PLAY 键 | ✅ 运行 |
| pkg-16 | **v5 窗口化** + DOM 自检 + Host 半 + `lolc_dom_report` | ✅ 运行 |
| pkg-17 | **v5.1**：修 React #310 hook 计数崩溃（`el(Art, …)`） | ✅ 运行 |
| pkg-18 | **v5.2**：拖拽重写 + 对话页英雄徽章 + 动作真实落账 + 全动作 toast | ✅ 运行 |
| pkg-19 | **v5.3**：英雄卡"仅选中"不再自动开新会话；徽章仅最小化显示 | ✅ 运行 |
| pkg-20 | **v5.4**：body 级对话主页壁纸 + 修最小化按钮（pointer capture 吞 click） | ✅ 运行 |
| pkg-21 | **v5.5**：删除最小化后弹出的英雄徽章浮层，英雄名并入启动器 | ✅ 运行 |
| pkg-22 | **v5.6**：背景真正透出（四 token 半透明 + `#root` 透明 + 渐变减轻） | ✅ 运行 |
| pkg-23（当前） | **v5.7**：壁纸跟随所选英雄 + 主页大图头像修复（object-position 移到 img） | ✅ 运行 |