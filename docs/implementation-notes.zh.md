# Agent Note: DeepSeek Harness 的英雄联盟客户端风格 Web 前端

Status: implemented

[English](2026-08-16-lol-client-style-web-frontend.md) | 中文

> 已作为动态 Cordis 插件 `lolc-1`（宿主分配 id）上线，当前 Package
> `pkg-23`（截至 2026-08-16；源码持久化于 `lol-client/client.js`，位于本
> note 树旁）。Package 历史：`pkg-1`/`pkg-2` 在客户端 apply 时失败，报
> `Cannot access 'CSS' before initialization` —— 函数体开头的 `return` 把
> 辅助常量留在了暂时性死区（TDZ）；`pkg-3` 把全部辅助定义放在最后的
> `return` 之前，运行干净；`pkg-4` 增加对局页排队匹配流、召唤师等级/经验
> 页脚与 hextech 微光；`pkg-5` 按 LCU 骨架整体重建（见下「Revision v2」）；
> `pkg-6` 接入真实 Riot 原画并带逐图 `onError` 字母卡降级；`pkg-7`（v4）
> 导航改顶部横排 + 全屏原画背景 + 金色「对局 PLAY」键；`pkg-16`（v5）
> 把客户端窗口化（此前是 `position:fixed; inset:0` + 
> `pointer-events:auto` 的全屏遮罩，盖住 DSH 对话主页并吞掉所有点击——
> 用户反馈"每个按钮点击后没反应"），并新增 Host 半：私有 RPC
> `lolc.probe.report` + 模型可调用的动态 Tool `lolc_dom_report`
> （无需截图的 DOM 自检通道）；`pkg-17`（v5.1）修复 React error
> #310 渲染崩溃：带 hooks 的 `Art` 组件在英雄/商城卡的 `map()` 里被当作
> 普通函数 `Art({...})` 调用，其 `useState` 计入调用方组件的 hook 顺序——
> 首页 1 个 Art、切英雄页瞬间 21 个导致计数跳变；4 处调用全部改为元素
> 形式 `el(Art, {...})`；`pkg-18`（v5.2）按用户实测反馈重做交互
> （拖动窗口乱跳/跑左上角只剩一半、选英雄在客户端外不可见、开始对局/
> 上一局"没反应"、商城/社交"无实际意义"）：拖动改为按下时以
> `.lc-client` 的 `getBoundingClientRect()` 为基准并 `setPointerCapture`；
> 对话页常驻「当前英雄」徽章；并把动作真正映射到会话上——
> `workspaces.startSession()` 返回 void 且从不打开新会话，故现在
> startGame 置 pending 标记、`allIds` effect 检测到新会话即自动
> `sessions.open()`；战队进入改用 `connectWorkspace()` 取 SessionId；
> 所有动作弹出金色 toast 代替无声失败；`pkg-19`（v5.3）修复下一轮
> 实测反馈——"选择英雄后,弹窗来一个英雄框,还无法拖动"：英雄卡此前
> `setHeroChamp + startGame()`，而 v5.2 的 startGame 会自动创建并
> `sessions.open()` 新会话（用户看到的"英雄框弹窗"其实是 DSH 被切进新
> 会话），且常驻左下角英雄徽章（z-index 22）在窗口打开时叠在窗口左下角
> 之上，像个拖不动的英雄框。现在英雄卡只选中（toast + 徽章/对局页同步），
> 英雄徽章仅窗口最小化时渲染，拖动增加 `onPointerCancel` 兜底；
> `pkg-20`（v5.4）修复"主对话页面还是没背景图"+"客户端的最小化按钮
> 也失灵"：标题栏 `setPointerCapture` 会把合成 click 重定向到标题栏，最小化
> 按钮的 onClick 永不触发（修：`onTitleDown` 命中 button 时提前返回），并在
> body 注入深色原画壁纸 + 底 token 半透明化让 DSH 主页透出原画；
> `pkg-21`（v5.5）移除"最小化后弹出的英雄图片窗口"——用户反馈
> "点击最小化后,弹出来一个英雄图片的窗口":自检证明最小化本身正常
> （winbtn→launcher 链路），但最小化后左下角弹出 v5.2/v5.3 加的**英雄徽章**
> （herobadge：44px 原画头像 + 名字 + 段位的 fixed 胶囊），观感恰似"弹出一个
> 英雄图片窗口"。已整体删除 herobadge 元素与 CSS，所选英雄改为纯文字并入
> 右下角启动器（`客户端 · 当前英雄 XX`），最小化后不再有任何图片浮层；
> `pkg-22`（v5.6）修复"不会弹出窗口了,但是背景是深色纯色"——v5.4
> 只半透明化最外层 bg-base，DSH 内层 token（layer-1/layer-2/sidebar）仍不透明，
> 壁纸被完全盖住。现已把四个背景 token 全部半透明化 + `#root` 强制
> transparent + 减轻壁纸暗化渐变，亚索原画真正透出为整页背景（文字仍可读）；
> `pkg-23`（v5.7，当前）修复"选完英雄后不会变"+"主页大图看不到脸"——
> 壁纸从 apply() 写死 Yasuo_0 改为 Lobby 内 React `<style>` 按 heroChamp
> 渲染（换英雄即换整页背景原画）；主页 hero 的 object-position 此前写在
> 包裹 div 上（对替换元素无效，图片一直默认居中裁剪切掉头像），已移到
> `.lc-hero-art .lc-artimg` 并把大图加高到 360px。

## Revision v5.5 — 删除最小化后弹出的英雄徽章浮层（pkg-21，2026-08-16）

用户："背景还是回弹窗来一个英雄图片的窗口,这不对啊" —— 经追问确认：点
最小化后确实会弹出一个带英雄图片的浮层。自检数据证明最小化按钮本身正常
（点 `lc-winbtn` → 经 `lc-launcher` 重开），但最小化后左下角出现 v5.2/v5.3
为"对话页显示所选英雄"加的**英雄徽章**（herobadge：fixed 胶囊，44px 原画
头像 + 英雄名 + 段位），看起来正是"弹出来的英雄图片窗口"。
- 从 closed 分支渲染中删除 herobadge 元素及其全部 CSS（`.lc-herobadge*`）。
- 所选英雄改为右下角启动器内的纯文字：`客户端 · 当前英雄 XX`（仍满足
  "选择在客户端外可见"的早期诉求，但不再有图片浮层）。
- 对话页背景保留 v5.4 的 body 级深色原画壁纸。
- 验证：update run-23 完成、`currentPackageId pkg-21`、Host/Client
  `waitingFor: []`、无诊断；源码已同步 `lol-client/client.js`。

## Revision v5.7 — 壁纸跟随所选英雄 + 主页大图头像修复（pkg-23，2026-08-16）

用户："不过选完英雄后不会变，而且客户端主页的『欢迎回来，召唤师』，里面的
图片还是有些看不到脸，图片太靠上了，被截断了"。
- **壁纸不跟随选英雄**：apply() 里 `styles.insert` 写死了 Yasuo_0 壁纸，
  换谁都不变。修复：Lobby 渲染一个 React `<style>` 元素（`wallpaperCss`），
  background-image 按 `heroChamp` 取 `SPLASH(hero.id)`（当前英雄 0 号原画）
  ——选哪个英雄，整页背景立即切换；apply() 只保留底色 + `#root` 透明两条
  固定规则，避免两条 background-image !important 竞争。
- **主页大图切脸**：根因是 `.lc-hero-art` 的 `object-position: 50% 18%`
  声明在包裹 div 上，而 object-fit/object-position 只对替换元素（img）
  生效——规则从未起作用，图片一直用默认 50% 50% 居中裁剪，头像（画面上部）
  被切。修复：定位规则移到 `.lc-hero-art .lc-artimg`（真正的 img），并把
  大图加高 320→360px 给头像呼吸空间。
- 验证：update run-25 完成、`currentPackageId pkg-23`、Host/Client
  `waitingFor: []`、无诊断；源码已同步 `lol-client/client.js`。

## Revision v5.6 — 让壁纸真正透出为整页背景（pkg-22，2026-08-16）

用户确认"可以，不会弹出窗口了，但是背景是深色纯色"——浮层问题已解决，但对话页
仍是纯深色而非原画。根因：v5.4 只把最外层 `--dsw-alias-bg-base` 改半透明，
DSH 页面内层仍用**不透明**深色 token（`--dsw-alias-bg-layer-1` #0A1428、
`layer-2` #101C30、`--dsw-specific-sidebar-fill` #010A13），把 body 壁纸
完全盖住。
- 四个背景 token 全部半透明化：bg-base rgba(1,10,19,0.4)、layer-1
  rgba(10,20,40,0.45)、layer-2 rgba(16,28,48,0.38)、sidebar
  rgba(1,10,19,0.35)；overlay 保持 0.9 保证弹层可读。
- 注入 CSS 强制 `#root { background: transparent !important; }`，任何
  容器色都不再挡住 body 图。
- 壁纸暗化渐变减轻（0.35 → 0.6 → 0.85），亚索原画整页可见，文字仍
  由渐变兜底可读。
- 窗口/启动器/最小化/无英雄浮层行为与 v5.5 一致。
- 验证：update run-24 完成、`currentPackageId pkg-22`、Host/Client
  `waitingFor: []`、无诊断；源码已同步 `lol-client/client.js`。

## Revision v5.4 — 对话主页壁纸 + 修最小化按钮失灵（pkg-20，2026-08-16）

用户反馈："主对话页面还是没背景图" + "客户端的最小化按钮也失灵"。
- **最小化按钮失灵**：标题栏 `onTitleDown` 对 header 执行
  `setPointerCapture`，指针捕获会把后续所有 pointer 事件（含浏览器合成的
  click）重定向到捕获元素 header——click 落到标题栏而非按钮，onClick 永不
  触发；而普通拖动正常（自检日志见标题栏点击 `tag:"HEADER" btn:false` 且
  `winOff` 持续变化）。修复：`onTitleDown` 检测 `e.target.closest('button')`
  为真时提前返回，最小化键不再启动拖拽/捕获。
- **主页无背景图**：窗口外正是 DSH 对话主页，其底色被覆盖为不透明
  `#010A13`，纯黑单调。修复：`styles.insert` 一条 body 级壁纸（深色亚索
  splash + 暗化渐变、`background-attachment: fixed`），并把
  `--dsw-alias-bg-base`(dark) 改为半透明 `rgba(1,10,19,0.62)`，DSH 页面层
  透出原画，渐变保证文字可读。
- 快照自检：`clicks` 加入 interval 依赖，2s 快照反映最近点击数。
- 验证：update run-22 完成、`currentPackageId pkg-20`、Host/Client
  `waitingFor: []`、无诊断；源码已同步 `lol-client/client.js`。

## Revision v5.3 — 选英雄不再弹会话；徽章仅最小化时显示（pkg-19，2026-08-16）

v5.2 后用户反馈："选择英雄后，弹窗来一个英雄框，还无法拖动。。。" —— 两层
叠加根因：(1) 英雄卡 `onClick` 是 `setHeroChamp(i) + startGame()`，而 v5.2
的 startGame 会自动打开新会话（pending 标记 + allIds effect →
`sessions.open()`），所以点英雄会直接切进一个新对话——观感即"英雄框弹窗"；
(2) 常驻英雄徽章（`position:fixed`、`z-index:22`、左下角）在窗口打开
（居中 94vw×92vh）时叠在窗口左下角上，似一个拖不动的框。
- 英雄卡现在只调用 `pickChampion(i)`（`setHeroChamp` + toast「已选择 X ——
  点「开始对局」出战」）；真正开始会话只发生在显式的「开始对局 / 对局
  PLAY / 开始排位 / 购买并开始」按钮上。
- 英雄徽章只渲染于 `view === 'closed'`（窗口最小化）分支，不再遮挡打开
  的窗口；最小化时对话页仍能看到所选英雄（延续上一轮需求）。
- 拖动：新增 `onPointerCancel` 清 `dragRef`（pointercancel 兜底）。
- 验证：update run-21 完成、`currentPackageId pkg-19`、Host/Client
  `waitingFor: []`、无诊断；源码已同步 `lol-client/client.js`。

## Revision v5.2 — 按真实用户测试修复交互（pkg-18，2026-08-16）

v5.1 后用户反馈："我想拖动客户端窗口，结果它在浏览器页面里乱跳，现在跑到
左上角去了，而且只显示一半"；"选了英雄不应该在对话页面也有英雄吗"；"开始
对局、上一局，也没反应；商城、社交，都没有实际意义，很多点完都没反应"。
- **拖动**：旧 `onTitleDown` 以 `winOff`（null → (0,0)）为基准，窗口被按
  "鼠标距离**视口左上角**的位移"定位，首拖即跳到左上角。修复：按下时快照
  `.lc-client` 的 `getBoundingClientRect()` 并叠加指针增量；
  `setPointerCapture` 保证指针移出标题栏后继续跟随。
- **英雄徽章**：选英雄此前只改客户端内部状态；现在窗口外常驻胶囊（原画
  头像 + 名字 + 段位，左下角，点击回英雄页），选择在 DSH 对话页始终可见。
- **真实会话动作**：经 `Service.listService` 查证 `workspaces.startSession()`
  返回 void（创建但**从不打开**）、`connectWorkspace(id)` 返回
  `Promise<SessionId>`；故开始对局现在自动打开新建会话（pending 标记 +
  allIds effect → `sessions.open()`），战队进入用 `connectWorkspace` 再打开，
  会话进入用 `sessions.open(id)`；每个动作由金色 toast（2.6s）确认。
- 验证：update run-20 完成、`currentPackageId pkg-18`、Host/Client
  `waitingFor: []`、无诊断；源码已同步 `lol-client/client.js`。

## Revision v5.1 — 修复 React #310 hook 计数崩溃（pkg-17，2026-08-16）

pkg-16 已验证运行（68 条 DOM 自检报告持续回流），但随后 Slot 渲染崩溃：
`Minified React error #310`（"Rendered more hooks than during the previous
render"），栈为 `Art → Array.map → ChampionsPanel → Lobby`。根因：`Art`
自带 `React.useState`（图片加载失败降级），却在英雄/商城卡片的 `map()`
内部以普通函数调用——React 中组件以普通函数调用不算独立组件边界，其
hooks 被计入**调用方**组件的 hook 顺序：首页只有 1 个 Art，切到英雄页
瞬间变成 21 个，计数跳变 → #310。修复：4 处调用点（hero 原画、对局页
已选英雄、英雄卡、商城卡）全部改为 `el(Art, {...})`，使每个 `Art` 成为
真正的元素组件、自有 hook 上下文，面板切换不再改变 Lobby 的 hook 序列。
已验证：update run-19 完成、`currentPackageId pkg-17`、Host/Client
`waitingFor: []`、overlay 占用者重新 active（priority -3）、DOM 自检
报告恢复（15 条：`view:"lobby" tab:"home" total:4 running:1 wsCount:1`）。
- **通用教训**：任何带 hooks 的可复用组件，如果在 `.map()` 或条件分支中
  渲染，必须用 `el(Component, props)` 挂载——绝不能在别的组件渲染体内以
  裸函数方式调用。

## Revision v5 — 窗口化客户端 + DOM 自检（pkg-16，2026-08-16）

v4 后用户反馈："我看差不多了，但是每个按钮点击后没反应"，随后自行定位根因
"原来是客户端把对话主页遮住了"。根因：v4 的 `.lc-client` 是全视口
`position: fixed; inset: 0` + `pointer-events: auto` 的盒子，把整个 DSH
对话主页盖住并吃掉全部点击——"没反应的按钮"其实是点在了覆盖层上、底下被
遮住的界面。pkg-16 修复：
- **窗口化**：`.lc-client` 变为居中浮动窗口（`min(1140px, 94vw)` ×
  `min(780px, 92vh)`、圆角、阴影、金色描边）；`.lc-slot` 保持
  `pointer-events: none`，窗口外一切点击穿透回 DSH 对话页，始终可见可操作。
  标题栏可拖动窗口（pointer 事件）、双击居中，最小化收为右下角启动器。
  移除 v4 的全屏 `.lc-bgimg`/`.lc-bgshade` 背景层，窗口自带深色底。
- **DOM 自检（替代本会话无法实现的无头截图）**：根元素 `onClickCapture`
  捕获每次点击命中（标签/类名/是否按钮/坐标），连同每 2 秒状态快照
  （view/tab/queue/统计/窗口位置/最近点击），经私有 RPC
  `lolc.probe.report`（`host.call` → `harness.handle`）上报新的 Host 半；
  Host 保留最近 200 条并注册动态 Tool `lolc_dom_report`，模型直接读取真实
  交互数据，无需截图。已验证：68 条存储，样例
  `view:"lobby", tab:"home", total:4, running:1, wsCount:1, winOff:null`。
- **架构变化**：插件不再是纯 Client——Host 半仅含一个私有 RPC handler +
  一个只读 Tool，仍不消费任何新 Service。

## Revision v2 — LCU 高保真复刻 + 真实 Riot 素材（2026-08-16）

v1（pkg-4）的用户反馈："有点难看，而且和英雄联盟客户端区别很大，不是很像，
我想要那种很复刻的感觉" —— 仪表盘式大厅读起来像"LOL 主题仪表盘"，不是客户端
本体。决策：放弃装饰性仪表盘，按真客户端的空间骨架重建。

- **骨架（pkg-5）**：62px 左侧窄图标栏（SVG 线稿：主页/对局/英雄/藏品/商城/
  战利品/设置，悬停高亮、选中金色左缘条）；细深色标题栏（DEEPSEEK 衬线 logo、
  「在线」脉冲点、版本号、最小化/关闭窗口控制）；可收起右侧社交栏（好友·对局中
  = 运行中会话、好友·离线 = 已停止会话、战队·工作区 = 工作区）；底部召唤师信息条
  （头像、等级（由会话数推出）、经验条、蓝色精粹/点券、社交栏开关）；对局页段位
  徽章（段位由总会话数推出）+ 队列选择卡 + 金色「开始排位」+ 排队流；克制的深蓝
  黑/金配色；衬线标题字体（以 Palatino 系近似 Beaufort）。
- **真实素材（pkg-6）**：主页 hero 变全幅英雄原画 + 5 点轮播；英雄页变为 21 名
  真实英雄池（`CHAMPS` 表，真实名称/职责）；商城页展示精选皮肤。素材全部来自
  Riot 官方无版本号 ddragon splash 端点（`/cdn/img/champion/splash/<id>_<n>.jpg`）。
  每个 `<img>` 带 `onError`：离线或被 CSP 拦截时降级为深蓝渐变 + 首字母卡，
  界面永不失效、无需网络保证。
- **映射**：对局 = 真实的 `workspaces.startSession()`；战队 = 工作区；召唤师
  等级/段位/LP 由会话数推导 —— 无伪造业务数据；货币为装饰性常驻内容（标注
  蓝色精粹/点券）。
- **考虑的替代方案**：以真客户端截图作背景图（否决——体积大、易碎、授权问题）；
  全部美术内联为 data-URI（否决——包体巨大，CDN+降级在离线时并无优势）；保留
  Unicode 字形仪表盘（否决——正是用户反馈的问题）。
- **后果**：复刻版从真客户端的空间语法出发（图标栏 → 内容 → 社交栏 → 召唤师
  条），联网时以正版 Riot 美术为视觉锚点；离线时依然呈现完整的客户端框架。
  pkg-6 验证：`running`、`currentPackageId pkg-6`、Client `waitingFor: []`、
  实时 `shell.overlay` 占用者 `lol-client-lobby` active。

## Problem

DeepSeek Harness 的 Web GUI 是工具化的平面风格：深色三栏框架、平铺的 alias
token，没有产品身份。目标是一个*英雄联盟客户端风格*的 web 前端页面（深蓝黑底
+ 金色 hextech 边框 + 左侧图标栏 + 顶部状态条 + 中央卡片面板），同时不破坏出厂
框架——会话浏览、对话、工具卡片、设置与审批都在 `ui-layout` 的 AppFrame 里，
且 `root` slot 目录明确禁止在那里注册（动态条目会赢下单座并让整页空白）。

## Decision

LoL 客户端前端以一个**纯 Client 动态 Cordis 插件**交付，只走两个既有扩展点，
不触碰任何 single 座位：

1. **主题覆盖层** —— `ctx.theme.overrideTokens('lol-client', …)` 以
   `{ light, dark }` 配对覆盖全部 13 个 alias token（dark：`#010A13` 基色、
   金色 `#C8AA6E`/`#785A28`、羊皮纸文字 `#F0E6D2`；light：可读的羊皮纸适配）。
   返回的 disposer 由 `ctx.effect` 持有，stop/update/unload 时精确还原旧主题。
   运行时校验拒绝裸字符串，因此每个值都是配对——apply 后全应用立即换色。
2. **可加整帧大厅** —— 以新 id `lol-client-lobby` 注册一个条目进
   `shell.overlay`（list slot，`replaceRisk: none`），这是唯一可加的整帧座位。
   条目渲染客户端风格大厅：顶部状态条、左侧图标栏（主页/对局/英雄/藏品/设置）、
   hero 面板、统计卡、"最近对局"与"我的工作区"面板（数据来自 slot 标准 props
   `useSessions`/`useWorkspaces`）、对局排队页与设置页。对局页提供可交互的
   排队匹配：开始排位 → 金色进度条（约 2.6s，经可选 `timer` 服务）→
   「对局已找到」→ `workspaces.startSession()` 并自动最小化大厅，用户直接
   落在新会话。由于 `.overlayLayer > *` 会把指针事件还给条目根节点，大厅可
   交互；根包装保持 `pointer-events: none`，所以大厅之外不会挡住应用。
   关闭/最小化控件可收起为右下角金色启动按钮，普通 harness 工作永不被永久
   遮挡。全部 React hooks 集中在顶层 `Lobby` 组件（纯函数子面板不持有
   hooks），保证排队状态机符合 rules-of-hooks。

Seam 三角作用域：插件只是 DSH 已拥有的 theme-token 与 `shell.overlay`
契约的 **Consumer**；不声明新 Service、不注册 `root`/`sidebar`/
`conversation`/`details`、不需要 Host 半（会话/工作区数据走 slot 标准套件，
open/start 动作经 `ctx.get('sessions')`/`ctx.get('workspaces')`）。"模型可见
⟺ 可记录"平凡成立：没有模型可见内容进入请求路径。

## Alternatives considered

**吃掉 `root` slot / 替换 AppFrame。** 否决——slot 目录写着 "DO NOT
register here"；单座会遮蔽 `ui-layout` 框架并卸载全部后代座位，只剩大厅、
产品消失。

**注册进 `conversation`（中栏）。** 否决——那是 session-maybe 单座；吃掉它
等于替换 hero 与实时对话，破坏主工作流。

**Fork / 修改 `apps/web` 或 `ui-layout` 做永久换肤。** 否决——动态插件让改动
收敛、可逆、可作为一个 Package 评审；静态换肤会撞上浏览器快照 CI 与
"插件而非改 loop"规则。

**Host 半通过 RPC 暴露会话数据。** 否决——`shell.overlay` 标准 props 已携带
实时 `useSessions`/`useWorkspaces`；再走 Host 拉一遍是复制 Slot 已提供的
能力。

## Consequences

插件一运行，整个 GUI 立即换色，LCU 骨架的复刻客户端页面一键可达（默认打开，
可最小化为角落启动器）。底层出厂框架与所有座位保持挂载可用；停止插件
（`cordis_stop`）通过 disposer 链移除大厅并还原旧主题。验证证据（pkg-6）：run
状态 `running`、`currentPackageId pkg-6`，实时 `shell.overlay` 树报告条目
`lol-client-lobby` 为 active。插件本身是动态、进程级的——源码已持久化于
`lol-client/client.js`；同款皮肤的持久化 bundle/preset 形态属后续工作，
不在本决策范围。