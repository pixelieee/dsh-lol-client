# lol-client — DeepSeek Harness 英雄联盟客户端复刻 Web 前端

> 交付物：动态 Cordis 插件 `lolc-1`（当前 Package `pkg-23`），运行于
> http://127.0.0.1:3080 的 Web GUI。Client + Host 双半实现，不触碰任何 single-seat slot。

## 快速安装（DeepSeek Harness 动态插件）

本插件通过 DSH 的**动态 Cordis 插件**机制注入，无需改动宿主框架：

1. 打开 DSH Web GUI 的插件定义面板（`cordis_define`）：
   - **Host 半**：`plugin-host.js` 全文（DOM 自检接收器 + `lolc_dom_report` 工具）；
   - **Client 半**：`plugin-client.js` 全文（窗口化登录大厅，所有 UI 与逻辑）。
2. 定义后 `cordis_run` 激活（首次 Client 激活需在界面批准）。
3. 停用：`cordis_stop(lolc-1)`；彻底移除：`cordis_undefine(lolc-1)`。

要求：DSH 具备 `theme.overrideTokens`（alias token 覆盖）、`shell.overlay` 列表
slot、`sessions` / `workspaces` / `timer` 可选服务——均为 DSH 标准能力。

## 这是什么

给 DeepSeek Harness 的 Web GUI 换上**高保真英雄联盟客户端（LCU）复刻**皮肤，
按真客户端骨架逐页重建，全部走既有扩展点，不改出厂框架：

1. **Hextech 主题层**（`ctx.theme.overrideTokens('lol-client', …)`）— 覆盖全部
   13 个 alias token 的 light/dark 双值配对，deep navy `#010A13/#0A1428` +
   金 `#C8AA6E/#785A28` + 羊皮纸 `#F0E6D2` + 青绿 `#0AC8B9`。disposer 由
   `ctx.effect` 持有，停用即还原。
2. **整帧客户端大厅**（`shell.overlay` list slot，id `lol-client-lobby`）—
   复刻 LCU 布局骨架（v5 起为**浮动窗口**，见下）：
   - **顶部水平导航栏**：7 项（主页/对局/英雄/藏品/商城/战利品/设置），SVG 线稿
     图标 + 文字，选中金色下缘条；右侧**金色大「对局 PLAY」键**一键 startSession。
   - **深色标题栏**：DEEPSEEK 衬线 logo +「在线」脉冲点 + 版本号 + 最小化按钮。
     v5 起标题栏可**拖动窗口**、双击复位居中。
   - **右侧社交栏**（可收起）：好友·对局中（running 会话）/好友·离线（stopped 会话）/
     战队·工作区，点击即进入。
   - **底部召唤师信息条**：头像、等级（由会话数推导）、经验条、蓝色精粹/点券、
     社交栏开关。
   - **主页**：全幅真实英雄原画 hero（5 点轮播）+ 底部标题/按钮 + 新闻栏 + 我的对局统计。
   - **对局页**：段位徽章（段位由总会话数推出）+ 队列选择卡（单排/双排、灵活组排）+
     已选英雄 + 金色「开始排位」→ 排队动画/进度条 →「对局已找到」→
     `workspaces.startSession()` 真正创建新会话并最小化进"峡谷"。
   - **英雄页**：21 名真实英雄池（Riot 官方 splash 原画），点击装备该英雄并开始对局。
   - **商城页**：本周精选皮肤卡（真实原画 + 价格）。**战利品页**：会话即宝箱。
   - **设置页**：皮肤/数据/素材说明 + 最小化按钮。

## v5.7 壁纸跟随所选英雄 + 主页大图头像修复（pkg-23，用户实测反馈）

- **问题 1「选完英雄后不会变」**：整页背景壁纸在 apply() 里写死为
  Yasuo_0，选任何人都不变。修复：壁纸改为由 Lobby 内 React `<style>`
  元素按 heroChamp 渲染（`wallpaperCss`）——选哪个英雄，页面背景立即换成
  该英雄的官方 0 号原画（同一套暗化渐变）；apply() 中的静态
  background-image 规则已删除，避免两条 !important 竞争。
- **问题 2「主页大图看不到脸，太靠上被截断」**：根因是 `.lc-hero-art`
  上的 `object-position: 50% 18%` 写在包裹 div 上，而 object-fit/
  object-position 只对替换元素（img）生效——规则从未起作用，图片一直用
  默认 50% 50% 居中裁剪，头像（位于画面上部）被切掉。修复：定位规则移到
  `.lc-hero-art .lc-artimg`（真正的 img）上，并把大图加高
  （320→360px）让头像有呼吸空间。

## v5.6 让壁纸真正透出为整页背景（pkg-22，用户实测反馈）

- **问题**：v5.5 后"不会弹出窗口了，但是背景是深色纯色"——body 级壁纸被
  DSH 页面内部的多层**不透明背景 token** 全部盖住：v5.4 只把最外层
  `--dsw-alias-bg-base` 改半透明，但 `--dsw-alias-bg-layer-1/2`（#0A1428、
  #101C30）与 `--dsw-specific-sidebar-fill`（#010A13）仍不透明，亚索原画
  完全透不出。
- **修复**：四个背景 token 全部半透明化（rgba 0.35~0.45）；注入 CSS 强制
  `#root { background: transparent !important; }`；同时把壁纸自身的暗化
  渐变减轻（0.35→0.85），让原画整页可见，文字仍可读。窗口/启动器/最小化/
  无英雄浮层行为与 v5.5 一致。

## v5.5 移除最小化后弹出的"英雄图片窗口"（pkg-21，用户实测反馈）

- **问题**：用户反馈"点击最小化后，弹出来一个英雄图片的窗口，这不对"。
  自检数据显示最小化本身工作正常（`lc-winbtn` → `lc-launcher` 点击流），
  但最小化后左下角会弹出 v5.2/v5.3 加的**英雄徽章**（herobadge：带 44px
  原画头像 + 名字 + 段位的 fixed 浮层胶囊）——用户把它当成"弹出来的英雄
  图片窗口"。
- **修复**：彻底删除 herobadge 元素与全部 CSS；当前英雄改为**纯文字**并入
  右下角启动器（`客户端 · 当前英雄 XX`）。最小化后不再有任何图片浮层，
  对话页背景由 v5.4 的 body 级深色原画壁纸承担。

## v5.4 对话主页背景图 + 最小化按钮失灵（pkg-20，用户实测反馈）

- **最小化按钮失灵**：标题栏 `onTitleDown` 对 header 执行
  `setPointerCapture`，会把后续 pointer 事件（含合成 click）**重定向到标题栏**，
  于是点最小化按钮时 click 落在 header 而非 button，onClick 永不触发。
  自检快照证实：用户点标题栏时记录 `tag:"HEADER" btn:false`，而 `winOff`
  一直在变（拖动正常、按钮点击丢失）。修复：`onTitleDown` 检测到目标在
  button 内（最小化键）时直接返回，不启动拖拽、不捕获指针。
- **主对话页面没有背景图**：窗口外露出的是 DSH 对话主页，底色被
  `--dsw-alias-bg-base` 覆盖为纯黑 `#010A13`，单调。修复：
  ① `styles.insert` 一条 **body 级壁纸**（深色英雄原画 Yasuo 0 号 +
  暗化渐变，`background-attachment: fixed` 不随滚动）；
  ② `--dsw-alias-bg-base`(dark) 从不透明 `#010A13` 改为
  `rgba(1,10,19,0.62)` 半透明，让 DSH 页面层透出原画，渐变保证文字可读。
- 快照自检顺带把 `clicks` 纳入 interval 依赖，2s 快照现在能反映最近点击数。

## v5.3 选英雄即弹窗问题（pkg-19，用户实测反馈）

- **问题**：用户反映"选择英雄后，弹窗来一个英雄框，还无法拖动"。两层根因：
  1. 英雄卡点击 = `setHeroChamp(i) + startGame()`，而 v5.2 的 startGame 会
     自动 `sessions.open()` 新会话——"弹窗英雄框"其实是 DSH 被切进刚创建的
     新会话界面；
  2. 左下角常驻英雄徽章（`position:fixed; z-index:22`）在窗口打开（居中
     94vw×92vh）时会**叠在窗口左下角之上**，看似一个拖不动的英雄框。
- **修复**：① 英雄卡点击只选中英雄（更新徽章/对局页 + toast「已选择 X ——
  点开始对局出战」），不再自动开始对局；② 英雄徽章仅 `view==='closed'`
  （窗口最小化）时渲染，窗口打开时不出现、不遮挡；③ 拖动增加
  `onPointerCancel` 清理兜底。
- 选英雄后的落点：徽章（窗口关时）+ 对局页「已选择英雄」+ toast；真正
  「开始对局 / 对局 PLAY / 开始排位」才创建并切入新会话。

## v5.2 交互修复（pkg-18，用户实测反馈）

- **拖拽修复**：此前拖动以 `winOff` 相对偏移为基准（首拖为 (0,0)），窗口被按
  "鼠标相对视口左上角的位移"定位，表现为乱跳、跑到左上角只剩一半。现按下时
  以 `.lc-client` 实际 `getBoundingClientRect()` 为基准叠加指针增量，并
  `setPointerCapture` 保证指针移出标题栏后事件不丢；双击标题栏仍可复位居中。
- **对话页英雄徽章**：客户端窗口外常驻「当前英雄」胶囊（原画头像 + 名字 +
  段位，左下角），点击打开英雄页。选中的英雄在对话主页始终可见——选择有实际
  意义，不再只在客户端内部生效。
- **动作真正落到会话上（修复"点完没反应"）**：查证 API 后发现
  `workspaces.startSession()` 返回 void 且**不打开**新建会话，所以"开始对局"
  之前只是无声创建。现改为：
  - 开始对局 / PLAY / 商城购买 → `startSession()` 后 `pendingOpen` 置位，
    `allIds` 快照 effect 检测到新会话 id 即自动 `sessions.open()` 切入并 toast；
  - 上一局 / 好友 / 藏品 / 战利品 → `sessions.open(id)` + toast；
  - 战队 / 工作区 → `workspaces.connectWorkspace(id)` 取得 SessionId 再打开 +
    toast。
- **全动作 toast 反馈**：客户端顶部金色提示条（2.6s 自动消失），任何动作不再
  无声。

## v5 窗口化（pkg-16，修复点击失效与遮挡主页）

- **问题**：v4 `.lc-client` 为 `position:fixed; inset:0` 全屏遮罩 + `pointer-events:auto`，
  把 DSH 对话主页整个盖住并吃掉所有点击，用户误以为"每个按钮点击后没反应"。
- **修复**：`.lc-client` 变为**居中浮动窗口**（`width: min(1140px, 94vw)`、
  `height: min(780px, 92vh)`、圆角 + 阴影 + 金色描边），`.lc-slot` 保持
  `pointer-events:none` 点击穿透——窗口外 DSH 对话页始终可见可操作，窗口内
  按钮恢复正常。窗口可拖动（标题栏 pointer 事件）、双击居中、最小化收为
  右下角"客户端"启动器。
- **移除** v4 的全屏背景层 `.lc-bgimg`/`.lc-bgshade`，窗口自带深色底。

## DOM 自检（pkg-16 新增，模型可读真实交互数据）

- Client 根元素 `onClickCapture` 记录每次点击命中（标签/类名/是否按钮/坐标），
  每 2 秒上报状态快照（view/tab/queue/统计/窗口位置/最近点击）。
- 经 Package 私有 RPC `lolc.probe.report`（`host.call` → `harness.handle`）送达
  **Host 半**；Host 保留最近 200 条并注册动态 Tool **`lolc_dom_report`**，
  模型可直接调用读取——不依赖截图即可验证真实 UI 交互（替代本会话无法使用的
  无头浏览器截图）。
- 验证：`lolc_dom_report` 返回 `{stored, tail}`；实例输出 `view:"lobby",
  tab:"home", total:4, running:1, wsCount:1, winOff:null`。

## 真实美术素材

- 素材来自 **Riot 官方 ddragon splash CDN**（无版本号端点）：
  `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/<id>_<n>.jpg`。
- 每个 `<img>` 带 `onError` 降级：加载失败（离线/CSP 拦截）自动隐藏并显示
  「深蓝渐变 + 英雄首字母」卡牌，界面永不完全崩溃。
- 英雄/角色/价格等元数据为真实游戏数据；「对局=智能体会话、战队=工作区」为
  语义映射，非伪造业务数据。

## 架构与作用域纪律

- **Consumer-only**：只消费 DSH 已拥有的 theme-token 与 `shell.overlay` 契约，
  不声明新 Service、不发 session 事件。
- **不注册 single 座位**：`root` / `sidebar` / `conversation` / `details` 一律不动。
- **Client 半**：会话/工作区数据走 slot 标准 props；open/start 动作经
  `ctx.get('sessions')` / `ctx.get('workspaces')`（带 undefined 检查）。
- **Host 半（新增）**：仅一个私有 RPC handler + 一个动态 Tool，不暴露业务能力。
- **hooks 纪律**：全部 React hooks 集中在顶层 `Lobby`；纯函数子面板不持 hooks；
  图片 `Art` 组件用 DOM 事件降级而不用 hooks。
- **可选服务**：`ctx.get('timer')` 缺省时排队流退化为立即匹配；interval 上报同源。

## 如何激活 / 停用

- 激活（本会话已有运行）：进程重启后需在 GUI 中重建动态插件 `lolc-1`，Client
  代码见 `client.js`（pkg-23 权威源码快照）+ `code.host`（见 pkg-16 起定义，
  未变），定义后 `cordis_run`。
- 停用：`cordis_stop(lolc-1)` — 大厅消失、主题层 disposer 还原原配色。
- 彻底移除：`cordis_undefine(lolc-1)`。

## 验证证据

- run 状态：`state: running`、`currentPackageId: pkg-23`、Host/Client `waitingFor: []`。
- `Slots.listSubTree('shell.overlay')`：占用者 `lol-client-lobby`
  （registrant `dyn/lolc-1`）active = true。
- `Tool.listTools`：`lolc_dom_report` 已注册；直接调用返回真实快照（68 条存储）。
- 主题层运行时校验通过（`overrideTokens` 对裸字符串抛教学错误；apply 成功即
  证明全部 token 为合法 light/dark 配对）。

## 变更记录

| Package | 内容 | 状态 |
|---|---|---|
| pkg-1 / pkg-2 | 首版（主题 + 大厅） | ❌ client apply 失败（TDZ） |
| pkg-3 | 修复求值顺序 | ✅ 运行（v1 仪表盘风格） |
| pkg-4 | +排队流/召唤师页脚 | ✅ 运行 |
| pkg-5 | **LCU 复刻骨架**（图标栏/标题栏/社交栏/召唤师条/对局页） | ✅ 运行 |
| pkg-6 | +真实 Riot splash 素材（hero 轮播/英雄池/商城/降级） | ✅ 运行 |
| pkg-7 | v4：顶部横排导航 + 全屏原画背景 + 金色 PLAY 键 | ✅ 运行 |
| pkg-16 | **v5 窗口化**（修全屏遮罩吃点击）+ DOM 自检 + Host 半 + `lolc_dom_report` 工具 | ✅ 运行 |
| pkg-17 | **v5.1**：修 React #310 hook 计数崩溃——`Art` 组件 4 处调用改为元素调用 `el(Art, …)`，成为独立组件边界，切页不再计数跳变 | ✅ 运行 |
| pkg-18 | **v5.2**：拖拽重写（rect 基准 + pointer capture）；对话页英雄徽章；动作真实落账（自动开新会话 / connectWorkspace / sessions.open）+ 全动作 toast | ✅ 运行 |
| pkg-19 | **v5.3**：英雄卡改为"仅选中"不再自动开新会话（修"选英雄弹英雄框"）；英雄徽章仅窗口最小化时显示；onPointerCancel 拖动兜底 | ✅ 运行 |
| pkg-20 | **v5.4**：body 级对话主页壁纸（深色原画+渐变，底 token 半透明透出）+ 修最小化按钮（按钮点击不再被标题栏 pointer capture 吞掉） | ✅ 运行 |
| pkg-21 | **v5.5**：删除最小化后弹出的英雄徽章浮层（herobadge），当前英雄以纯文字并入右下角启动器 | ✅ 运行 |
| pkg-22 | **v5.6**：背景改为真正透出——四个背景 token 半透明化 + `#root` 强制透明 + 壁纸暗化渐变减轻 | ✅ 运行 |
| pkg-23（当前） | **v5.7**：壁纸跟随所选英雄（React `<style>` 按 heroChamp 渲染）+ 主页大图头像修复（object-position 移到 img、大图加高 320→360px） | ✅ 运行 |

## 关联文档

- 决策记录：`.agents/notes/implemented/feature/2026-08-16-lol-client-style-web-frontend.md`（含中文配对与完整 Alternatives）
- 工程方法论：`skills/agent-harness-engineering/`（SKILL.md / CHECKLIST.md / LEARNING-PATH.md）