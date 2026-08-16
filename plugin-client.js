// lol-client v5.7 — DeepSeek Harness 英雄联盟客户端复刻 Web 前端（窗口化 + DOM 自检）
// Dynamic Cordis Client Package source snapshot (pkg-23, plugin lolc-1).
//
// v5.7 修复(用户反馈「选完英雄后不会变」+「主页大图看不到脸,太靠上被截断」):
//   1) 整页背景壁纸改为跟随所选英雄 — 此前 body 壁纸在 apply() 里写死为
//      Yasuo_0,选任何人都不变。现改为由 Lobby 内的 React <style> 元素按
//      heroChamp 渲染,选哪个英雄,页面背景就换成该英雄的官方原画(0 号
//      splash + 同一套暗化渐变)。
//   2) 主页 hero 大图头像被裁 — 根因:.lc-hero-art 上的 object-position
//      (50% 18%)写在了包裹 div 上,而 object-fit/object-position 只对替换
//      元素(img)生效,div 上无效,图片一直用默认 50% 50% 居中裁剪,
//      头像位于画面上部被切掉。修复:定位规则移到 .lc-hero-art .lc-artimg
//      上,并把大图加高(320→360px)让头像有呼吸空间。
//
// v5.6 修复(用户反馈「不会弹出窗口了,但是背景是深色纯色」):
//   壁纸图被 DSH 页面内部的几层不透明背景(token)全部盖住,只露出最底下的
//   纯黑。修复:把 --dsw-alias-bg-base/layer-1/layer-2/sidebar 全部改为
//   半透明 rgba(0.35~0.45),#root 强制 transparent,并降低 body 壁纸的暗化
//   渐变(0.35→0.85),让亚索原画真正透出为整页背景。
//
// v5.5 修复:删除最小化后弹出的「英雄徽章」浮层(用户反馈"弹出来一个英雄
// 图片的窗口"——即 herobadge),当前英雄改为纯文字并入右下角启动器。
//
// v5.4 修复:最小化按钮失灵(标题栏 setPointerCapture 吞掉按钮 click —
//   自检证实 tag=HEADER/btn=false);对话主页 body 级壁纸(Yasuo 0 splash +
//   暗化渐变)+ --dsw-alias-bg-base 半透明化透出原画;快照携带点击数。
//
// v5.3 修复:英雄卡仅选中不再自动开新会话(修「选英雄弹英雄框」);
//   onPointerCancel 拖动兜底。
//
// v5.2 修复:拖动以 rect 为基准 + pointer capture;对话页英雄徽章;动作真实
// 落账(startGame 自动开新会话 / connectWorkspace / sessions.open)+ toast。
//
// v5.2 修复(用户反馈:窗口拖动乱跳/跑左上角只显示一半;选英雄对话页看不到;
// 开始对局/上一局没反应;商城/社交点完没反应):
//   1) 拖动重写 — 按下时以 .lc-client 的 getBoundingClientRect() 实际位置为基准
//      (不再用 winOff 相对偏移,首次拖动不再是(0,0)导致窗口跳到视口左上角),
//      并 setPointerCapture 保证指针移出标题栏后事件不丢;拖动范围被收敛到
//      视口内(不依赖 window/document,用按下点做近似边界)。
//   2) 对话页英雄徽章 — overlay 内、客户端窗口之外常驻显示「当前英雄」徽章
//      (英雄原画头像 + 名字,点击回客户端英雄页)。选中的英雄在对话主页始终
//      可见,选择即有意义。
//   3) 动作真正落到会话上 — startGame 现在记录 pending 标记,监听到新会话 id
//      (startSession 返回 void 不打开)后自动 sessions.open() 并 toast;战队进入
//      改用 workspaces.connectWorkspace(id) 拿到 SessionId 再 open;上一局/好友
//      进入 = sessions.open(id) + toast。
//   4) 全动作 toast 反馈 -「开始对局/购买并开始/进入战队/进入对局」在客户端
//      顶部弹出金色提示条(2.6s 自动消失),点击不再无声。
//
// v5.1 修复:React error #310(Art 组件带 hooks 在 map() 里被裸函数调用,
// hook 计入调用方顺序导致计数跳变)→ 4 处调用改为元素形式 el(Art, {...})。
//
// v5 修复反馈:客户端此前是 position:fixed 全屏遮罩,把 DSH 对话主页整个盖住
// 并吃掉所有点击(用户点到的按钮其实是无响应的遮罩层)。现改为:
//   1) 窗口化 — .lc-client 变成居中浮动的客户端窗口(宽度/高度受限、圆角、
//      阴影、金色描边),窗口外区域保持 pointer-events:none 点击穿透,DSH
//      对话主页始终可见可操作;标题栏可拖拽移动(双击复位居中),右上角最小化
//      收为右下角启动器。
//   2) 移除全屏背景层(.lc-bgimg/.lc-bgshade),窗口自带深色底。
//   3) DOM 自检 — 根元素 onClickCapture 记录每次点击命中(标签/类名/坐标/是否
//      按钮),2 秒一次状态快照(view/tab/queue/统计/窗口偏移),经 host.call
//      'lolc.probe.report' 私有 RPC 上报宿主;宿主注册动态 Tool 'lolc_dom_report'
//      供模型读取,实现不依赖截图的真实交互数据回传。
//
// Persisted from the running plugin so the deliverable survives a process
// restart. To re-apply: cordis_define (kind:new, client half = this file's
// body) then cordis_run; or the same code under any future Package version.
// Interfaces consumed (verified via Inspect before authoring):
//   - ctx.theme.overrideTokens(source, { token: { light, dark } }) -> disposer
//   - ctx.slots.inject('shell.overlay', () => ctx.slots.register(...))
//   - shell.overlay standard props: useSessions / useWorkspaces
//   - ctx.get('sessions') / ctx.get('workspaces') / ctx.get('timer') (optional)
//   - host.call (Client builtin) + harness.handle/registerTool (Host builtin)
//   - Riot ddragon splash CDN (no version segment): /cdn/img/champion/splash/<id>_<n>.jpg
// Every contribution is fiber-owned (ctx.effect / slots.inject disposers).
//
// NOTE: evaluation order is significant — helper consts/functions first,
// the plugin `return` LAST (a leading return leaves consts in the TDZ).

const el = React.createElement

const eqSessions = (a, b) => a && b && a.length === b.length
  && a.every((x, i) => x.id === b[i].id && x.title === b[i].title
    && x.running === b[i].running && x.completed === b[i].completed
    && x.blank === b[i].blank)
const eqWorkspaces = (a, b) => a && b && a.length === b.length
  && a.every((x, i) => x.id === b[i].id && x.title === b[i].title
    && x.path === b[i].path && x.count === b[i].count)
const eqStats = (a, b) => a && b && a.total === b.total
  && a.running === b.running && a.workspaces === b.workspaces

const ICO = function (name) {
  const common = {
    className: 'lc-ico',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }
  switch (name) {
    case 'home':
      return el('svg', common,
        el('path', { d: 'M3 11 L12 4 L21 11' }),
        el('path', { d: 'M5 9.5 V20 H19 V9.5' }),
        el('path', { d: 'M10 20 V14.5 H14 V20' }))
    case 'play':
      return el('svg', common,
        el('path', { d: 'M4 4 L20 20' }),
        el('path', { d: 'M20 4 L4 20' }),
        el('path', { d: 'M3 4 L6 7' }),
        el('path', { d: 'M18 17 L21 20' }))
    case 'champion':
      return el('svg', common,
        el('path', { d: 'M12 4 L13.5 6.5 H10.5 Z' }),
        el('path', { d: 'M5 15 C6 11 9 9.5 12 9.5 C15 9.5 18 11 19 15' }),
        el('path', { d: 'M8 19 C9 17.5 15 17.5 16 19' }))
    case 'collection':
      return el('svg', common,
        el('path', { d: 'M4 6 H20' }),
        el('path', { d: 'M6 6 L6 20 H18 L18 6' }),
        el('path', { d: 'M9 10 H15' }),
        el('path', { d: 'M9 14 H15' }))
    case 'store':
      return el('svg', common,
        el('path', { d: 'M4 9 H20 L18 20 H6 Z' }),
        el('path', { d: 'M8 9 C8 5.5 10 4 12 4 C14 4 16 5.5 16 9' }))
    case 'loot':
      return el('svg', common,
        el('path', { d: 'M12 3 L19 6 V11 C19 16 16 19.5 12 21 C8 19.5 5 16 5 11 V6 Z' }),
        el('path', { d: 'M9 12 L11 14 L15 10' }))
    case 'settings':
      return el('svg', common,
        el('circle', { cx: '12', cy: '12', r: '3' }),
        el('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' }))
    default:
      return el('svg', common, el('circle', { cx: '12', cy: '12', r: '8' }))
  }
}

const CHAMPS = [
  { id: 'Ahri', name: '阿狸', roles: '法师 · 刺客' },
  { id: 'Yasuo', name: '亚索', roles: '战士 · 刺客' },
  { id: 'Lux', name: '拉克丝', roles: '法师 · 辅助' },
  { id: 'Garen', name: '盖伦', roles: '战士 · 坦克' },
  { id: 'Jinx', name: '金克丝', roles: '射手' },
  { id: 'LeeSin', name: '李青', roles: '战士 · 打野' },
  { id: 'Darius', name: '德莱厄斯', roles: '战士 · 坦克' },
  { id: 'Thresh', name: '锤石', roles: '辅助 · 坦克' },
  { id: 'Zed', name: '劫', roles: '刺客' },
  { id: 'Ezreal', name: '伊泽瑞尔', roles: '射手' },
  { id: 'Aatrox', name: '亚托克斯', roles: '战士' },
  { id: 'Akali', name: '阿卡丽', roles: '刺客' },
  { id: 'Ashe', name: '艾希', roles: '射手' },
  { id: 'Blitzcrank', name: '布里茨', roles: '辅助 · 坦克' },
  { id: 'Brand', name: '布兰德', roles: '法师' },
  { id: 'Caitlyn', name: '凯特琳', roles: '射手' },
  { id: 'DrMundo', name: '蒙多医生', roles: '坦克 · 战士' },
  { id: 'Fiora', name: '菲奥娜', roles: '战士 · 刺客' },
  { id: 'JarvanIV', name: '嘉文四世', roles: '坦克 · 战士' },
  { id: 'Katarina', name: '卡特琳娜', roles: '刺客' },
  { id: 'Morgana', name: '莫甘娜', roles: '法师 · 辅助' },
]
const TIERS = ['黑铁', '青铜', '白银', '黄金', '铂金', '钻石', '大师']
const RAILS = [
  { key: 'home', label: '主页', icon: 'home' },
  { key: 'play', label: '对局', icon: 'play' },
  { key: 'champions', label: '英雄', icon: 'champion' },
  { key: 'collection', label: '藏品', icon: 'collection' },
  { key: 'store', label: '商城', icon: 'store' },
  { key: 'loot', label: '战利品', icon: 'loot' },
  { key: 'settings', label: '设置', icon: 'settings' },
]
const SPLASH = function (champId, idx) {
  const n = idx === undefined ? 0 : idx % 5
  return 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champId + '_' + n + '.jpg'
}

function Art({ src, alt, cls, fallbackCls }) {
  const [broken, setBroken] = React.useState(false)
  if (broken) {
    return el('div', { className: 'lc-artwrap ' + cls },
      el('div', { className: 'lc-artfb ' + (fallbackCls || '') },
        el('span', { className: 'lc-artfb-letter' }, String(alt || '?').slice(0, 1)),
      ),
    )
  }
  return el('div', { className: 'lc-artwrap ' + cls },
    el('img', {
      className: 'lc-artimg',
      src: src,
      alt: alt || '',
      loading: 'lazy',
      onError: () => setBroken(true),
    }),
  )
}

function Lobby(props) {
  const { useSessions, useWorkspaces, sessions, workspaces, timer } = props
  const [view, setView] = React.useState('lobby')
  const [tab, setTab] = React.useState('home')
  const [social, setSocial] = React.useState(true)
  const [queue, setQueue] = React.useState('idle')
  const [qmode, setQmode] = React.useState('solo')
  const [heroChamp, setHeroChamp] = React.useState(0)
  const queueSeq = React.useRef(0)

  // ---- v5.2 窗口化:位置偏移(null=居中) + 拖拽 + DOM 自检 ----
  const [winOff, setWinOff] = React.useState(null)
  const dragRef = React.useRef(null)
  const rectRef = React.useRef(null)
  const [clicks, setClicks] = React.useState([])
  const snapRef = React.useRef({})
  const [toast, setToast] = React.useState(null)
  const toastSeq = React.useRef(0)
  const pendingOpen = React.useRef(false)
  const lastIds = React.useRef(null)

  const report = (entry) => {
    try {
      const p = host.call('lolc.probe.report', entry)
      if (p && p.then) p.catch(() => {})
    } catch (err) { /* noop */ }
  }

  const showToast = (text) => {
    const seq = toastSeq.current + 1
    toastSeq.current = seq
    setToast({ text: String(text), seq })
    if (timer !== undefined) {
      timer.timeout(() => {
        if (toastSeq.current === seq) setToast(null)
      }, 2600)
    }
  }

  // v5.2 拖拽:以窗口当前实际 rect 为基准(不再用 winOff 相对偏移),
  // pointer capture 保证指针移出标题栏后事件不丢。
  // v5.4:点标题栏内按钮(最小化)不启动拖拽 — setPointerCapture 会把后续
  // click 重定向到标题栏,导致按钮的 onClick 永远收不到事件(用户反馈"最小化
  // 按钮失灵")。
  const onTitleDown = (e) => {
    if (!e || e.button !== 0) return
    if (e.target && e.target.closest && e.target.closest('button')) return
    const el = e.currentTarget && e.currentTarget.parentElement
    if (el) {
      try { rectRef.current = el.getBoundingClientRect() } catch (err) { rectRef.current = null }
    }
    dragRef.current = { sx: e.clientX, sy: e.clientY }
    try {
      if (e.currentTarget && e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
    } catch (err) { /* noop */ }
  }
  const onTitleMove = (e) => {
    const d = dragRef.current
    if (!d || !rectRef.current) return
    const nx = rectRef.current.left + (e.clientX - d.sx)
    const ny = rectRef.current.top + (e.clientY - d.sy)
    setWinOff({ x: Math.round(nx), y: Math.round(ny) })
  }
  const onTitleUp = (e) => {
    dragRef.current = null
    try {
      if (e && e.currentTarget && e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) { /* noop */ }
  }
  const onTitleCancel = () => { dragRef.current = null }

  const captureClick = (e) => {
    let rec = { at: Date.now() }
    try {
      const t = e.target
      if (t) {
        rec.tag = String(t.tagName || '')
        rec.cls = String(t.className || '').slice(0, 80)
        rec.btn = !!(t.closest && t.closest('button, a, [role=button]'))
        rec.x = Math.round(e.clientX || 0)
        rec.y = Math.round(e.clientY || 0)
      }
    } catch (err) { rec.err = String(err).slice(0, 120) }
    rec.kind = 'click'
    setClicks((prev) => {
      const next = prev.concat(rec)
      return next.length > 12 ? next.slice(next.length - 12) : next
    })
    report(rec)
  }

  const stats = useSessions((s) => {
    let running = 0
    for (const id of s.ids) if (s.byId[id] && s.byId[id].running) running += 1
    return { total: s.ids.length, running, workspaces: 0 }
  }, eqStats)
  const statsWs = useWorkspaces((s) => ({ total: s.items.length, running: 0, workspaces: s.items.length }), eqStats)
  const total = stats.total
  const running = stats.running
  const wsCount = statsWs.workspaces

  const recent = useSessions((s) => s.ids.slice(0, 12).map((id) => {
    const row = s.byId[id]
    return {
      id,
      title: row ? row.displayTitle : id,
      running: row ? row.running === true : false,
      completed: row ? row.completed === true : false,
    }
  }).filter((x) => x.title !== '' && x.title !== undefined), eqSessions)

  const wsList = useWorkspaces((s) => s.items.slice(0, 12).map((w) => ({
    id: w.workspaceId,
    title: w.title,
    path: w.path,
    count: w.sessionIds.length,
  })), eqWorkspaces)

  // v5.2:id-only 快照,用于检测 startSession 产生的新会话
  const allIds = useSessions((s) => s.ids.slice(), (a, b) => a && b && a.length === b.length && a.every((x, i) => x === b[i]))

  const openSession = (id, label) => {
    if (id !== undefined && sessions !== undefined) {
      sessions.open(id)
      showToast('已进入「' + (label || id) + '」')
    }
  }
  // v5.3:选英雄 = 仅选中(更新徽章/对局页),不再自动开始对局
  const pickChampion = (i) => {
    const c = CHAMPS[i % CHAMPS.length]
    setHeroChamp(i)
    if (c) showToast('已选择 ' + c.name + ' —— 点「开始对局」出战')
  }
  const startGame = () => {
    if (workspaces === undefined) return
    pendingOpen.current = true
    workspaces.startSession()
    showToast('正在创建对局…')
  }
  const enterWorkspace = (id) => {
    if (id === undefined || workspaces === undefined) return
    showToast('正在进入工作区…')
    if (sessions !== undefined) {
      const p = workspaces.connectWorkspace(id)
      if (p && p.then) {
        p.then((sid) => {
          if (sid !== undefined) {
            sessions.open(sid)
            showToast('已进入工作区会话')
          }
        }).catch(() => { /* noop */ })
        return
      }
    }
    workspaces.startSession(id)
  }

  const startQueue = () => {
    if (queue !== 'idle') return
    if (timer === undefined) { setQueue('found'); startGame(); setView('closed'); return }
    setQueue('queuing')
    const seq = queueSeq.current + 1
    queueSeq.current = seq
    timer.timeout(() => {
      if (queueSeq.current !== seq) return
      setQueue('found')
      startGame()
      timer.timeout(() => {
        if (queueSeq.current !== seq) return
        setQueue('idle')
        setView('closed')
      }, 1400)
    }, 2400)
  }

  const level = Math.min(99, total + 1)
  const tier = TIERS[Math.min(TIERS.length - 1, Math.floor(total / 3))]
  const lp = (total * 13) % 100
  const hero = CHAMPS[heroChamp % CHAMPS.length]

  // v5.2:startGame/排队创建的会话靠 startSession 同步出现于 ids;
  // pendingOpen 置位后,监听会话 id 出现新成员即自动打开并 toast。
  React.useEffect(() => {
    if (allIds && allIds.length > 0) {
      const fresh = lastIds.current
        ? allIds.filter((id) => lastIds.current.indexOf(id) < 0)
        : allIds
      if (fresh.length > 0) {
        if (pendingOpen.current) {
          pendingOpen.current = false
          if (sessions !== undefined) {
            sessions.open(fresh[fresh.length - 1])
            showToast('对局已就绪，正在进入召唤师峡谷…')
          }
        }
      }
      lastIds.current = allIds.slice()
    }
  }, [allIds])

  snapRef.current = { view, tab, queue, qmode, social, total, running, wsCount, winOff, clicks: clicks.length }
  React.useEffect(() => {
    if (timer === undefined) return undefined
    const handle = timer.interval(() => {
      report({ kind: 'snapshot', at: Date.now(), clicks: clicks, s: snapRef.current })
    }, 2000)
    return handle
  }, [timer, clicks])

  const winStyle = winOff
    ? { position: 'fixed', left: winOff.x, top: winOff.y, transform: 'none' }
    : null

  // v5.7:整页背景壁纸跟随所选英雄 — 用 React <style> 渲染 body 背景,
  // 换英雄时 CSS 文本变化,浏览器自动应用新的原画。渲染在 .lc-slot 首位,
  // 窗口打开/最小化都保持挂载,背景持续生效。
  const wallpaperCss =
    "html, body { background-color: #010A13 !important; }\n" +
    "body {\n" +
    "  background-image:\n" +
    "    linear-gradient(rgba(1, 10, 19, 0.35), rgba(1, 10, 19, 0.6) 55%, rgba(1, 10, 19, 0.85)),\n" +
    "    url('" + SPLASH(hero.id) + "') !important;\n" +
    "  background-size: cover !important;\n" +
    "  background-position: center 20% !important;\n" +
    "  background-repeat: no-repeat !important;\n" +
    "  background-attachment: fixed !important;\n" +
    "}\n"

  return el('div', { className: 'lc-slot', onClickCapture: captureClick },
    el('style', { key: 'lc-wallpaper', 'data-lc-wallpaper': '1' }, wallpaperCss),
    view === 'closed'
      ? el('button', {
        className: 'lc-launcher',
        onClick: () => setView('lobby'),
        'aria-label': '打开英雄联盟客户端',
      }, ICO('play'), el('span', { className: 'lc-launcher-text' }, '客户端 · 当前英雄 ' + hero.name))
      : el('div', { className: 'lc-client', style: winStyle },
        // 顶部内栏：品牌 + 在线 + 窗口控制（v5 可拖拽移动窗口）
        el('header', {
          className: 'lc-titlebar',
          onPointerDown: onTitleDown,
          onPointerMove: onTitleMove,
          onPointerUp: onTitleUp,
          onPointerCancel: onTitleCancel,
          onDoubleClick: () => setWinOff(null),
          title: '拖动移动窗口 · 双击居中',
        },
          el('div', { className: 'lc-brands' },
            el('span', { className: 'lc-logo' }, 'DEEPSEEK'),
            el('span', { className: 'lc-logo-sub' }, 'HARNESS · 英雄联盟客户端'),
          ),
          el('div', { className: 'lc-title-right' },
            el('span', { className: 'lc-online' }, el('i', { className: 'lc-dot' }), '在线'),
            el('span', { className: 'lc-ver' }, 'v5.7 窗口'),
            el('button', { className: 'lc-winbtn', onClick: () => setView('closed'), 'aria-label': '最小化' }, '\u2013'),
          ),
        ),
        // v5.2:动作反馈 toast(顶部悬浮,2.6s 消失)
        toast && el('div', { className: 'lc-toast', key: toast.seq }, toast.text),
        // 顶部横向导航栏 + 右端大 PLAY 键
        el('nav', { className: 'lc-topnav', 'aria-label': '客户端导航' },
          el('div', { className: 'lc-navitems' },
            RAILS.map((r) => el('button', {
              key: r.key,
              className: 'lc-navitem' + (tab === r.key ? ' lc-navitem-on' : ''),
              onClick: () => setTab(r.key),
              'aria-label': r.label,
            },
            ICO(r.icon),
            el('span', { className: 'lc-navlabel' }, r.label),
            )),
          ),
          el('button', { className: 'lc-btn lc-btn-gold lc-btn-play', onClick: startGame },
            ICO('play'), el('span', null, '对局 PLAY')),
        ),
        // 主体：内容 + 社交栏
        el('div', { className: 'lc-body' },
          el('main', { className: 'lc-main' },
            tab === 'home' && HomePanel({ startGame, recent, running, total, wsCount, openSession, hero, heroChamp, setHeroChamp }),
            tab === 'play' && PlayPanel({ startGame, queue, qmode, setQmode, onStartQueue: startQueue, tier, lp, recent, openSession, hero }),
            tab === 'champions' && ChampionsPanel({ onPick: pickChampion, heroChamp, setHeroChamp }),
            tab === 'collection' && CollectionPanel({ recent, openSession, total, running }),
            tab === 'store' && StorePanel({ startGame }),
            tab === 'loot' && LootPanel({ recent, openSession, running }),
            tab === 'settings' && SettingsPanel({ setView, total, wsCount }),
          ),
          social && el('aside', { className: 'lc-social' },
            SocialPanel({ recent, wsList, openSession, enterWorkspace, onClose: () => setSocial(false) }),
          ),
        ),
        // 底部召唤师信息条
        el('footer', { className: 'lc-bar' },
          el('div', { className: 'lc-profile' },
            el('span', { className: 'lc-avatar' }, 'S'),
            el('div', { className: 'lc-prof-meta' },
              el('span', { className: 'lc-prof-name' }, '召唤师'),
              el('div', { className: 'lc-prof-row' },
                el('span', { className: 'lc-prof-lv' }, '等级 ' + level),
                el('span', { className: 'lc-prof-xp' }),
              ),
            ),
          ),
          el('div', { className: 'lc-bar-right' },
            el('span', { className: 'lc-currency' }, '\u25C6 蓝色精粹 1250'),
            el('span', { className: 'lc-currency' }, '点券 0'),
            el('button', { className: 'lc-socialbtn', onClick: () => setSocial(!social) },
              el('span', null, '社交'), social ? '\u25B6' : '\u25C0'),
          ),
        ),
      ),
  )
}

// ---------- 各页 ----------

function HomePanel({ startGame, recent, running, total, wsCount, openSession, hero, heroChamp, setHeroChamp }) {
  const news = [
    { date: '今天', title: '英雄联盟客户端已窗口化', body: 'v5 起为浮动窗口，不再遮挡对话主页；标题栏可拖动，双击居中。' },
    { date: '今天', title: '排队匹配已上线', body: '前往「对局」页：开始排位 → 匹配成功 → 自动创建新的智能体会话。' },
    { date: '今天', title: '真实美术已接入', body: '英雄原画来自 Riot 官方资源服务器，离线时自动降级为首字母卡牌。' },
  ]
  const dots = [0, 1, 2, 3, 4].map((i) => el('button', {
    key: i,
    className: 'lc-dotbtn' + (i === heroChamp % 5 ? ' lc-dotbtn-on' : ''),
    onClick: () => setHeroChamp(i),
    'aria-label': '切换主题英雄 ' + CHAMPS[i].name,
  }))
  return el('div', { className: 'lc-page lc-home' },
    el('section', { className: 'lc-hero' },
      el(Art, { src: SPLASH(hero.id, heroChamp % 5), alt: hero.name, cls: 'lc-hero-art', fallbackCls: 'lc-hero-fb' }),
      el('div', { className: 'lc-hero-shade' }),
      el('div', { className: 'lc-hero-inner' },
        el('span', { className: 'lc-kicker' }, 'SEASON 2026 · ' + hero.name + ' 登场'),
        el('h1', { className: 'lc-hero-title' }, '欢迎回来，召唤师'),
        el('p', { className: 'lc-hero-sub' }, '你的 AI 协作召唤师峡谷已就绪。选择队列，进入对局；或从英雄池挑选你的本命英雄。'),
        el('div', { className: 'lc-hero-actions' },
          el('button', { className: 'lc-btn lc-btn-gold lc-btn-lg', onClick: startGame }, '开始对局'),
          recent.length > 0
            ? el('button', { className: 'lc-btn lc-btn-ghost', onClick: () => openSession(recent[0].id, recent[0].title) }, '继续上一局')
            : null,
        ),
      ),
      el('div', { className: 'lc-hero-dots' }, dots),
    ),
    el('section', { className: 'lc-home-row' },
      el('div', { className: 'lc-panel' },
        el('h3', { className: 'lc-panel-title' }, '新闻'),
        news.map((n, i) => el('div', { key: i, className: 'lc-news' },
          el('span', { className: 'lc-news-date' }, n.date),
          el('div', {},
            el('div', { className: 'lc-news-title' }, n.title),
            el('div', { className: 'lc-news-body' }, n.body),
          ),
        )),
      ),
      el('div', { className: 'lc-panel' },
        el('h3', { className: 'lc-panel-title' }, '我的对局'),
        el('div', { className: 'lc-quickstats' },
          el('div', { className: 'lc-quickstat' }, el('b', null, String(total)), el('span', null, '总对局')),
          el('div', { className: 'lc-quickstat' }, el('b', null, String(running)), el('span', null, '对局中')),
          el('div', { className: 'lc-quickstat' }, el('b', null, String(wsCount)), el('span', null, '工作区')),
        ),
      ),
    ),
  )
}

function PlayPanel({ startGame, queue, qmode, setQmode, onStartQueue, tier, lp, recent, openSession, hero }) {
  const modes = [
    { key: 'solo', name: '单排 / 双排', sub: '5v5 召唤师峡谷 · 排位', map: '峡谷' },
    { key: 'flex', name: '灵活组排', sub: '5v5 召唤师峡谷 · 组队', map: '峡谷' },
  ]
  const pname = qmode === 'solo' ? '单排 / 双排' : '灵活组排'
  return el('div', { className: 'lc-page' },
    el('section', { className: 'lc-playhead' },
      el('div', {},
        el('span', { className: 'lc-kicker' }, 'PLAY'),
        el('h1', { className: 'lc-page-title' }, '选择队列'),
      ),
      el('div', { className: 'lc-ranked' },
        el('div', { className: 'lc-emblem' },
          el('span', { className: 'lc-emblem-gem' }, '\u25C6'),
          el('span', { className: 'lc-emblem-tier' }, tier),
          el('span', { className: 'lc-emblem-lp' }, 'LP ' + lp),
        ),
      ),
    ),
    el('section', { className: 'lc-modes' },
      modes.map((m) => el('button', {
        key: m.key,
        className: 'lc-mode' + (qmode === m.key ? ' lc-mode-on' : ''),
        onClick: () => setQmode(m.key),
      },
      el('span', { className: 'lc-mode-map' }, m.map),
      el('span', { className: 'lc-mode-name' }, m.name),
      el('span', { className: 'lc-mode-sub' }, m.sub),
      )),
    ),
    el('section', { className: 'lc-playchamp' },
      el(Art, { src: SPLASH(hero.id), alt: hero.name, cls: 'lc-playchamp-art', fallbackCls: 'lc-playchamp-fb' }),
      el('div', { className: 'lc-playchamp-meta' },
        el('span', { className: 'lc-kicker' }, '已选择英雄'),
        el('div', { className: 'lc-playchamp-name' }, hero.name),
        el('div', { className: 'lc-playchamp-roles' }, hero.roles),
      ),
    ),
    el('div', { className: 'lc-queuezone' },
      queue === 'idle' && el('button', { className: 'lc-btn lc-btn-gold lc-btn-lg', onClick: onStartQueue }, '开始排位 · ' + pname),
      queue === 'queuing' && el('div', { className: 'lc-queuing' },
        el('span', { className: 'lc-spinner' }),
        el('span', null, '正在寻找对局…  ' + pname),
        el('span', { className: 'lc-gauge' }, el('i', { className: 'lc-gauge-fill' })),
      ),
      queue === 'found' && el('div', { className: 'lc-found' },
        el('span', { className: 'lc-found-hex' }, '\u2713'),
        el('span', null, '对局已找到！正在进入召唤师峡谷…'),
      ),
    ),
    el('section', { className: 'lc-panel' },
      el('h3', { className: 'lc-panel-title' }, '最近对局'),
      recent.length === 0
        ? el('p', { className: 'lc-empty' }, '暂无对局记录，点击上方「开始排位」进入第一局。')
        : el('ul', { className: 'lc-slist' },
          recent.map((r) => el('li', { key: r.id, className: 'lc-srow' },
            el('span', { className: 'lc-sgem' }, '\u25C6'),
            el('span', { className: 'lc-stitle', title: r.title }, r.title),
            el('span', { className: 'lc-sbadge ' + (r.running ? 'lc-sbadge-run' : 'lc-sbadge-done') }, r.running ? '对局中' : '已结束'),
            el('button', { className: 'lc-btn lc-btn-mini', onClick: () => openSession(r.id, r.title) }, '进入'),
          ))),
    ),
  )
}

function ChampionsPanel({ onPick, heroChamp, setHeroChamp }) {
  return el('div', { className: 'lc-page' },
    el('div', {},
      el('span', { className: 'lc-kicker' }, 'CHAMPIONS'),
      el('h1', { className: 'lc-page-title' }, '英雄'),
      el('p', { className: 'lc-page-desc' }, '点击英雄即装备为你当前的本命英雄，再到「开始对局」带它出战。'),
    ),
    el('div', { className: 'lc-champgrid' },
      CHAMPS.map((c, i) => el('button', {
        key: c.id,
        className: 'lc-champ' + (i === heroChamp % CHAMPS.length ? ' lc-champ-on' : ''),
        onClick: () => { setHeroChamp(i); onPick(i) },
        title: c.name + ' · ' + c.roles,
      },
      el('span', { className: 'lc-champ-art' },
        el(Art, { src: SPLASH(c.id), alt: c.name, cls: 'lc-champ-artimg' }),
        el('span', { className: 'lc-champ-frame' }),
      ),
      el('span', { className: 'lc-champ-name' }, c.name),
      el('span', { className: 'lc-champ-role' }, c.roles),
      )),
    ),
  )
}

function CollectionPanel({ recent, openSession, total, running }) {
  return el('div', { className: 'lc-page' },
    el('div', {},
      el('span', { className: 'lc-kicker' }, 'COLLECTION'),
      el('h1', { className: 'lc-page-title' }, '藏品'),
    ),
    el('div', { className: 'lc-colhead' },
      el('span', { className: 'lc-colstat' }, '全部会话 ' + total),
      el('span', { className: 'lc-colstat' }, '对局中 ' + running),
    ),
    recent.length === 0
      ? el('p', { className: 'lc-empty' }, '藏品为空。')
      : el('ul', { className: 'lc-collist' },
        recent.map((r) => el('li', { key: r.id, className: 'lc-colitem' },
          el('span', { className: 'lc-colitem-gem' }, '\u25C8'),
          el('span', { className: 'lc-colitem-name' }, r.title),
          el('button', { className: 'lc-btn lc-btn-mini', onClick: () => openSession(r.id, r.title) }, '查看'),
        ))),
  )
}

function StorePanel({ startGame }) {
  const featured = [CHAMPS[0], CHAMPS[9], CHAMPS[19]]
  return el('div', { className: 'lc-page' },
    el('div', {},
      el('span', { className: 'lc-kicker' }, 'STORE'),
      el('h1', { className: 'lc-page-title' }, '商城'),
      el('p', { className: 'lc-page-desc' }, '本周精选皮肤 —— 点击「购买」即携带该英雄进入对局（真实素材，来自 Riot 官方）。'),
    ),
    el('div', { className: 'lc-storegrid' },
      featured.map((c) => el('div', { key: c.id, className: 'lc-storecard' },
        el(Art, { src: SPLASH(c.id), alt: c.name, cls: 'lc-store-art', fallbackCls: 'lc-store-fb' }),
        el('div', { className: 'lc-store-meta' },
          el('span', { className: 'lc-store-name' }, c.name + ' · ' + c.roles.split(' · ')[0]),
          el('span', { className: 'lc-store-price' }, '\u25C6 1350 点券'),
        ),
        el('button', { className: 'lc-btn lc-btn-gold lc-btn-mini', onClick: startGame }, '购买并开始'),
      )),
    ),
  )
}

function LootPanel({ recent, openSession, running }) {
  return el('div', { className: 'lc-page' },
    el('div', {},
      el('span', { className: 'lc-kicker' }, 'LOOT'),
      el('h1', { className: 'lc-page-title' }, '战利品'),
    ),
    el('div', { className: 'lc-colhead' },
      el('span', { className: 'lc-colstat' }, '开启中的宝箱 ' + running),
    ),
    recent.length === 0
      ? el('p', { className: 'lc-empty' }, '暂无战利品。')
      : el('ul', { className: 'lc-collist' },
        recent.map((r) => el('li', { key: r.id, className: 'lc-colitem' },
          el('span', { className: 'lc-colitem-gem' }, '\u25C6'),
          el('span', { className: 'lc-colitem-name' }, r.title),
          el('button', { className: 'lc-btn lc-btn-mini', onClick: () => openSession(r.id, r.title) }, '开启'),
        ))),
  )
}

function SettingsPanel({ setView, total, wsCount }) {
  return el('div', { className: 'lc-page' },
    el('div', {},
      el('span', { className: 'lc-kicker' }, 'SETTINGS'),
      el('h1', { className: 'lc-page-title' }, '设置'),
    ),
    el('div', { className: 'lc-panel lc-settings' },
      el('div', { className: 'lc-setrow' }, el('span', null, '客户端皮肤'), el('b', null, '英雄联盟客户端复刻 v5.7 窗口')),
      el('div', { className: 'lc-setrow' }, el('span', null, '数据'), el('b', null, '会话 ' + total + ' · 工作区 ' + wsCount)),
      el('div', { className: 'lc-setrow' }, el('span', null, '美术素材'), el('b', null, 'Riot 官方 splash（离线自动降级）')),
      el('div', { className: 'lc-setrow' }, el('span', null, '操作'),
        el('button', { className: 'lc-btn lc-btn-ghost lc-btn-mini', onClick: () => setView('closed') }, '最小化客户端')),
    ),
  )
}

function SocialPanel({ recent, wsList, openSession, enterWorkspace, onClose }) {
  const online = recent.filter((r) => r.running)
  const offline = recent.filter((r) => !r.running)
  return el('div', { className: 'lc-social-inner' },
    el('div', { className: 'lc-social-head' },
      el('span', null, '社交'),
      el('button', { className: 'lc-social-x', onClick: onClose, 'aria-label': '收起社交栏' }, '\u00D7'),
    ),
    el('div', { className: 'lc-soccat' },
      el('span', { className: 'lc-soccat-title' }, '好友 · 对局中 (' + online.length + ')'),
      online.length === 0
        ? el('p', { className: 'lc-empty lc-empty-sm' }, '暂无在线召唤师。')
        : el('ul', { className: 'lc-soclist' },
          online.map((r) => el('li', { key: r.id, className: 'lc-socrow' },
            el('span', { className: 'lc-socavatar lc-socavatar-on' }, 'S'),
            el('span', { className: 'lc-socname' }, r.title),
            el('button', { className: 'lc-minibtn', onClick: () => openSession(r.id, r.title) }, '进入'),
          ))),
    ),
    el('div', { className: 'lc-soccat' },
      el('span', { className: 'lc-soccat-title' }, '好友 · 离线 (' + offline.length + ')'),
      offline.length === 0
        ? el('p', { className: 'lc-empty lc-empty-sm' }, '暂无其他召唤师。')
        : el('ul', { className: 'lc-soclist' },
          offline.slice(0, 8).map((r) => el('li', { key: r.id, className: 'lc-socrow' },
            el('span', { className: 'lc-socavatar' }, 'S'),
            el('span', { className: 'lc-socname lc-socname-off' }, r.title),
          ))),
    ),
    el('div', { className: 'lc-soccat' },
      el('span', { className: 'lc-soccat-title' }, '战队 · 工作区 (' + wsList.length + ')'),
      wsList.length === 0
        ? el('p', { className: 'lc-empty lc-empty-sm' }, '暂无战队。')
        : el('ul', { className: 'lc-soclist' },
          wsList.map((w) => el('li', { key: w.id, className: 'lc-socrow' },
            el('span', { className: 'lc-socbadge' }, '\u2694'),
            el('span', { className: 'lc-socname' }, w.title),
            el('button', { className: 'lc-minibtn', onClick: () => enterWorkspace(w.id) }, '进入'),
          ))),
    ),
  )
}

// ---------- 样式 ----------

const CSS = String.raw`
.lc-slot {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 21;
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #F0E6D2;
  font-size: 13px;
}

/* v5 窗口：居中浮动，窗口外点击穿透回 DSH */
.lc-client {
  pointer-events: auto;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(1140px, 94vw);
  height: min(780px, 92vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #050B14;
  border: 1px solid rgba(200, 170, 110, 0.4);
  border-radius: 8px;
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(1, 10, 19, 0.9);
}

/* 启动器 */
.lc-launcher {
  pointer-events: auto;
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px 9px 12px;
  cursor: pointer;
  color: #010A13;
  background: linear-gradient(180deg, #F0E6D2, #C8AA6E);
  border: 1px solid #F0E6D2;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-size: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
}
.lc-launcher:hover { filter: brightness(1.12); }
.lc-launcher .lc-ico { width: 16px; height: 16px; flex: none; }
.lc-launcher-text { white-space: nowrap; }

/* v5.2:动作反馈 toast */
.lc-toast {
  position: absolute;
  top: 84px;
  right: 16px;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  color: #010A13;
  background: linear-gradient(180deg, #F0E6D2, #C8AA6E);
  border: 1px solid #F0E6D2;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.55);
  animation: lcToastIn 0.18s ease-out;
}
@keyframes lcToastIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: none; }
}

/* 顶部标题栏（v5 可拖拽） */
.lc-titlebar {
  position: relative;
  z-index: 2;
  height: 32px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 0 14px;
  background: rgba(6, 16, 28, 0.82);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(200, 170, 110, 0.22);
  user-select: none;
  cursor: move;
  touch-action: none;
}
.lc-titlebar button { cursor: pointer; }
.lc-brands { display: flex; align-items: baseline; gap: 10px; }
.lc-logo {
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: #C8AA6E;
}
.lc-logo-sub { font-size: 11px; letter-spacing: 0.16em; color: #A09B8C; text-transform: uppercase; }
.lc-title-right { display: flex; align-items: center; gap: 10px; }
.lc-online { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #A09B8C; letter-spacing: 0.1em; }
.lc-dot { width: 7px; height: 7px; border-radius: 50%; background: #0AC8B9; box-shadow: 0 0 6px #0AC8B9; }
.lc-ver { font-size: 11px; color: #785A28; letter-spacing: 0.08em; }
.lc-winbtn {
  width: 30px; height: 24px; cursor: pointer; color: #A09B8C;
  background: transparent; border: 1px solid transparent; border-radius: 2px; font-size: 14px;
}
.lc-winbtn:hover { color: #F0E6D2; background: rgba(200, 170, 110, 0.12); }

/* 顶部横向导航 + 大 PLAY 键 */
.lc-topnav {
  position: relative;
  z-index: 2;
  height: 46px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 6px;
  background: rgba(6, 16, 28, 0.74);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(200, 170, 110, 0.18);
}
.lc-navitems { display: flex; align-items: center; gap: 2px; overflow-x: auto; }
.lc-navitem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 13px;
  cursor: pointer;
  color: #76879A;
  background: transparent;
  border: none;
  border-radius: 3px;
  white-space: nowrap;
}
.lc-navitem:hover { color: #F0E6D2; background: rgba(200, 170, 110, 0.08); }
.lc-navitem-on { color: #C8AA6E; }
.lc-navitem-on::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  height: 2px;
  background: #C89B3C;
  box-shadow: 0 0 8px rgba(200, 155, 60, 0.8);
}
.lc-navitem .lc-ico { width: 18px; height: 18px; }
.lc-navlabel { font-size: 12px; letter-spacing: 0.14em; }
.lc-btn-play {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 26px;
  font-size: 14px;
  box-shadow: 0 0 18px rgba(200, 155, 60, 0.35);
}
.lc-btn-play .lc-ico { width: 18px; height: 18px; }

/* 主体 */
.lc-body { position: relative; z-index: 2; flex: 1; min-height: 0; display: flex; }

/* 主内容 */
.lc-main { flex: 1; min-width: 0; overflow: auto; }
.lc-page { max-width: 1060px; margin: 0 auto; padding: 20px 26px 40px; display: flex; flex-direction: column; gap: 16px; }
.lc-kicker { font-size: 10px; letter-spacing: 0.34em; color: #C89B3C; text-transform: uppercase; }
.lc-page-title {
  margin: 4px 0 0;
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #F0E6D2;
  text-transform: uppercase;
}
.lc-page-desc { margin: 8px 0 0; color: #A09B8C; font-size: 12px; }
.lc-empty { color: #A09B8C; font-size: 13px; padding: 6px 2px; }
.lc-empty-sm { font-size: 12px; }

/* 美术降级基座 */
.lc-artwrap { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; }
.lc-artimg { width: 100%; height: 100%; object-fit: cover; display: block; }
.lc-artfb {
  display: none;
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, #0E1E32, #13243E 60%, #0A1428);
  border: 1px solid rgba(200, 170, 110, 0.3);
}
.lc-artfb-letter {
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  font-size: 44px;
  font-weight: 700;
  color: rgba(240, 230, 210, 0.55);
}

/* 主页 hero：加高 + 聚焦头部区域（脸可见） */
.lc-hero {
  position: relative;
  height: 360px;
  overflow: hidden;
  border: 1px solid rgba(200, 170, 110, 0.45);
  border-radius: 4px;
  background: #0A1428;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.45);
}
.lc-hero-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
/* v5.7:object-position 必须写在 img(替换元素)上——此前写在 div 上无效,
   图片一直 50% 50% 居中裁剪,头像在画面上部被切掉 */
.lc-hero-art .lc-artimg {
  object-fit: cover;
  object-position: 50% 18%;
}
.lc-hero-fb { position: absolute; inset: 0; }
.lc-hero-shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(1, 10, 19, 0.9) 0%, rgba(1, 10, 19, 0.5) 42%, rgba(1, 10, 19, 0.1) 78%),
    linear-gradient(0deg, rgba(1, 10, 19, 0.82) 0%, transparent 60%);
}
.lc-hero-inner { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px 30px; }
.lc-hero-title {
  margin: 8px 0 6px;
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #F0E6D2;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
}
.lc-hero-sub { margin: 0 0 16px; color: #D8D2C4; max-width: 520px; line-height: 1.7; font-size: 13px; text-shadow: 0 1px 8px rgba(0, 0, 0, 0.7); }
.lc-hero-actions { display: flex; gap: 10px; }
.lc-hero-dots {
  position: absolute;
  right: 18px;
  top: 14px;
  display: flex;
  gap: 6px;
}
.lc-dotbtn {
  width: 9px; height: 9px; border-radius: 50%; cursor: pointer;
  background: rgba(240, 230, 210, 0.35); border: 1px solid rgba(240, 230, 210, 0.5);
  padding: 0;
}
.lc-dotbtn-on { background: #C89B3C; border-color: #F0E6D2; }

/* 按钮 */
.lc-btn {
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #010A13;
  background: linear-gradient(180deg, #F0E6D2, #C8AA6E 70%, #A98E4C);
  border: 1px solid rgba(240, 230, 210, 0.7);
  border-radius: 3px;
  padding: 8px 20px;
}
.lc-btn:hover { filter: brightness(1.12); box-shadow: 0 0 12px rgba(200, 155, 60, 0.4); }
.lc-btn-ghost { background: rgba(6, 16, 28, 0.7); color: #C8AA6E; border: 1px solid #785A28; }
.lc-btn-ghost:hover { color: #F0E6D2; border-color: #C8AA6E; }
.lc-btn-mini { padding: 4px 10px; font-size: 11px; }
.lc-btn-lg { padding: 12px 36px; font-size: 14px; }

/* 面板 */
.lc-home-row { display: grid; grid-template-columns: 5fr 3fr; gap: 14px; }
@media (max-width: 900px) { .lc-home-row { grid-template-columns: 1fr; } }
.lc-panel {
  border: 1px solid rgba(200, 170, 110, 0.28);
  border-radius: 4px;
  background: rgba(8, 18, 32, 0.78);
  backdrop-filter: blur(5px);
  padding: 14px 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}
.lc-panel-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #C8AA6E;
}
.lc-news { display: flex; gap: 12px; padding: 9px 2px; border-bottom: 1px solid rgba(200, 170, 110, 0.12); }
.lc-news:last-child { border-bottom: none; }
.lc-news-date { flex: none; font-size: 10px; letter-spacing: 0.1em; color: #785A28; padding-top: 2px; }
.lc-news-title { font-size: 13px; font-weight: 600; color: #F0E6D2; }
.lc-news-body { font-size: 12px; color: #A09B8C; margin-top: 2px; line-height: 1.6; }
.lc-quickstats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.lc-quickstat { text-align: center; padding: 10px 4px; border-radius: 3px; background: rgba(1, 10, 19, 0.55); }
.lc-quickstat b { display: block; font-size: 20px; color: #C8AA6E; }
.lc-quickstat span { display: block; font-size: 11px; color: #A09B8C; margin-top: 2px; letter-spacing: 0.08em; }

/* 对局页 */
.lc-playhead { display: flex; align-items: flex-end; justify-content: space-between; }
.lc-ranked { display: flex; align-items: flex-end; gap: 12px; }
.lc-emblem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(200, 170, 110, 0.5);
  border-radius: 4px;
  background: rgba(8, 18, 32, 0.8);
  transform: skewX(-6deg);
  backdrop-filter: blur(4px);
}
.lc-emblem > * { transform: skewX(6deg); }
.lc-emblem-gem { color: #C89B3C; font-size: 18px; text-shadow: 0 0 10px rgba(200, 155, 60, 0.6); }
.lc-emblem-tier { font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif; font-size: 16px; font-weight: 700; letter-spacing: 0.1em; color: #F0E6D2; }
.lc-emblem-lp { font-size: 11px; color: #A09B8C; letter-spacing: 0.08em; }

.lc-modes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (max-width: 760px) { .lc-modes { grid-template-columns: 1fr; } }
.lc-mode {
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  padding: 16px;
  color: #F0E6D2;
  background: rgba(8, 18, 32, 0.78);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}
.lc-mode:hover { border-color: #C8AA6E; }
.lc-mode-on { border-color: #C89B3C; box-shadow: inset 0 0 0 1px rgba(200, 155, 60, 0.35); }
.lc-mode-map { display: inline-block; font-size: 10px; letter-spacing: 0.2em; color: #785A28; border: 1px solid #785A28; border-radius: 2px; padding: 2px 6px; }
.lc-mode-name { display: block; margin-top: 8px; font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif; font-size: 16px; font-weight: 700; letter-spacing: 0.08em; }
.lc-mode-sub { display: block; margin-top: 3px; font-size: 12px; color: #A09B8C; }

.lc-playchamp {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 4px;
  background: rgba(8, 18, 32, 0.78);
  backdrop-filter: blur(4px);
}
.lc-playchamp-art { width: 100px; height: 100px; border-radius: 3px; flex: none; }
.lc-playchamp-art img { object-position: 50% 16%; }
.lc-playchamp-fb { position: absolute; inset: 0; }
.lc-playchamp-meta { display: flex; flex-direction: column; gap: 4px; }
.lc-playchamp-name { font-family: "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; }
.lc-playchamp-roles { font-size: 12px; color: #A09B8C; }

.lc-queuezone { display: flex; justify-content: center; padding: 4px 0; min-height: 60px; align-items: center; }
.lc-queuing, .lc-found { display: flex; align-items: center; gap: 12px; color: #F0E6D2; letter-spacing: 0.08em; font-size: 13px; flex-wrap: wrap; }
.lc-found { color: #0AC8B9; }
.lc-found-hex { font-size: 20px; }
.lc-spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid #785A28; border-top-color: #C89B3C;
  animation: lcSpin 0.9s linear infinite;
}
@keyframes lcSpin { to { transform: rotate(360deg); } }
.lc-gauge {
  width: 180px; height: 6px; border-radius: 3px; overflow: hidden;
  background: #010A13; border: 1px solid #27313F;
}
.lc-gauge-fill {
  display: block; height: 100%; width: 0;
  background: linear-gradient(90deg, #785A28, #C89B3C, #F0E6D2);
  animation: lcGauge 2.4s ease-in-out forwards;
}
@keyframes lcGauge { 0% { width: 0%; } 100% { width: 100%; } }

.lc-slist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.lc-srow {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 3px; background: rgba(1, 10, 19, 0.55); border: 1px solid rgba(39, 49, 63, 0.7);
}
.lc-srow:hover { border-color: #785A28; }
.lc-sgem { color: #C89B3C; font-size: 12px; }
.lc-stitle { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lc-sbadge { font-size: 10px; padding: 2px 8px; border-radius: 10px; letter-spacing: 0.06em; }
.lc-sbadge-run { color: #010A13; background: #C89B3C; }
.lc-sbadge-done { color: #A09B8C; border: 1px solid #27313F; }

/* 英雄页 */
.lc-champgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.lc-champ {
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  padding: 0 0 10px;
  color: #F0E6D2;
  background: rgba(8, 18, 32, 0.8);
  border: 1px solid rgba(200, 170, 110, 0.25);
  border-radius: 4px;
  overflow: hidden;
  backdrop-filter: blur(3px);
}
.lc-champ:hover { border-color: #C8AA6E; box-shadow: 0 0 14px rgba(200, 155, 60, 0.25); }
.lc-champ-on { border-color: #C89B3C; box-shadow: 0 0 0 1px rgba(200, 155, 60, 0.5), 0 0 18px rgba(200, 155, 60, 0.3); }
.lc-champ-art { position: relative; display: block; height: 118px; background: #0E1E32; }
.lc-champ-artimg { width: 100%; height: 100%; object-fit: cover; object-position: 50% 14%; display: block; }
.lc-champ-frame {
  position: absolute; inset: 0;
  background: linear-gradient(0deg, rgba(1, 10, 19, 0.6), transparent 42%);
  pointer-events: none;
}
.lc-champ-name { display: block; padding: 8px 10px 0; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; }
.lc-champ-role { display: block; padding: 2px 10px 0; font-size: 11px; color: #A09B8C; }

/* 藏品 / 战利品 */
.lc-colhead { display: flex; gap: 12px; }
.lc-colstat { font-size: 11px; color: #A09B8C; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid rgba(200, 170, 110, 0.3); border-radius: 20px; padding: 3px 12px; background: rgba(6, 16, 28, 0.6); }
.lc-collist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.lc-colitem {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 3px; background: rgba(8, 18, 32, 0.8); border: 1px solid rgba(39, 49, 63, 0.7);
}
.lc-colitem-gem { color: #C89B3C; }
.lc-colitem-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 商城 */
.lc-storegrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 760px) { .lc-storegrid { grid-template-columns: 1fr; } }
.lc-storecard { display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid rgba(200, 170, 110, 0.3); border-radius: 4px; background: rgba(8, 18, 32, 0.8); backdrop-filter: blur(3px); }
.lc-store-art { height: 140px; border-radius: 3px; }
.lc-store-art img { object-position: 50% 18%; }
.lc-store-fb { position: absolute; inset: 0; }
.lc-store-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lc-store-name { font-size: 13px; font-weight: 700; }
.lc-store-price { font-size: 11px; color: #C89B3C; letter-spacing: 0.04em; }

/* 设置 */
.lc-settings { display: flex; flex-direction: column; }
.lc-setrow { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 2px; border-bottom: 1px solid rgba(200, 170, 110, 0.12); font-size: 13px; color: #A09B8C; }
.lc-setrow:last-child { border-bottom: none; }
.lc-setrow b { color: #F0E6D2; font-weight: 600; }

/* 社交栏 */
.lc-social {
  width: 264px;
  flex: none;
  background: rgba(6, 16, 28, 0.8);
  border-left: 1px solid rgba(200, 170, 110, 0.18);
  overflow: auto;
  backdrop-filter: blur(5px);
}
.lc-social-inner { padding: 12px 12px 20px; }
.lc-social-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #C8AA6E; }
.lc-social-x { cursor: pointer; color: #A09B8C; background: none; border: none; font-size: 14px; }
.lc-social-x:hover { color: #F0E6D2; }
.lc-soccat { margin-top: 12px; }
.lc-soccat-title { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #785A28; }
.lc-soclist { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.lc-socrow { display: flex; align-items: center; gap: 8px; padding: 6px 6px; border-radius: 3px; }
.lc-socrow:hover { background: rgba(200, 170, 110, 0.06); }
.lc-socavatar {
  flex: none;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: #1E2328;
  border: 1px solid #27313F;
  color: #A09B8C;
  font-size: 11px;
  font-weight: 700;
}
.lc-socavatar-on { border-color: #0AC8B9; color: #0AC8B9; }
.lc-socname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.lc-socname-off { color: #76879A; }
.lc-socbadge { color: #C89B3C; font-size: 12px; width: 26px; text-align: center; }
.lc-minibtn { cursor: pointer; color: #C8AA6E; background: none; border: 1px solid #785A28; border-radius: 3px; font-size: 10px; padding: 2px 8px; letter-spacing: 0.08em; }
.lc-minibtn:hover { color: #F0E6D2; border-color: #C8AA6E; }

/* 底部召唤师信息条 */
.lc-bar {
  position: relative;
  z-index: 2;
  height: 46px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: rgba(6, 16, 28, 0.84);
  backdrop-filter: blur(6px);
  border-top: 1px solid rgba(200, 170, 110, 0.22);
}
.lc-profile { display: flex; align-items: center; gap: 10px; }
.lc-avatar {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: linear-gradient(160deg, #0E1E32, #13243E);
  border: 1px solid #C8AA6E;
  color: #C8AA6E;
  font-size: 13px;
  font-weight: 700;
}
.lc-prof-meta { display: flex; flex-direction: column; gap: 4px; }
.lc-prof-name { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #F0E6D2; }
.lc-prof-row { display: flex; align-items: center; gap: 8px; }
.lc-prof-lv { font-size: 10px; color: #A09B8C; letter-spacing: 0.08em; }
.lc-prof-xp {
  width: 120px; height: 5px; border-radius: 3px; overflow: hidden;
  background: #010A13; border: 1px solid #27313F;
}
.lc-prof-xp::before {
  content: ''; display: block; width: 58%; height: 100%;
  background: linear-gradient(90deg, #785A28, #C89B3C);
}
.lc-bar-right { display: flex; align-items: center; gap: 14px; }
.lc-currency { font-size: 11px; color: #A09B8C; letter-spacing: 0.04em; }
.lc-socialbtn {
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  color: #C8AA6E;
  background: transparent;
  border: 1px solid #785A28;
  border-radius: 3px;
  font-size: 11px;
  letter-spacing: 0.1em;
  padding: 4px 10px;
}
.lc-socialbtn:hover { color: #F0E6D2; border-color: #C8AA6E; }
`

// ---------- 插件：定义在前，return 最后（TDZ 安全求值序） ----------

return {
  inject: ['theme', 'slots'],
  apply(ctx) {
    // v5.7:整页背景壁纸(跟随所选英雄的原画)由 Lobby 内的 React <style>
    // 渲染(wallpaperCss)。这里只保留底色与 #root 透明两条固定规则,避免
    // 与动态 <style> 的 background-image 产生两条 !important 竞争。
    ctx.effect(() => styles.insert(`
      html, body {
        background-color: #010A13 !important;
      }
      #root { background: transparent !important; }
    `), 'lol-client: page base + root transparent')

    ctx.effect(() => ctx.theme.overrideTokens('lol-client', {
      '--dsw-alias-bg-base': { light: '#F4EEDA', dark: 'rgba(1, 10, 19, 0.4)' },
      '--dsw-alias-bg-layer-1': { light: '#E8DFC4', dark: 'rgba(10, 20, 40, 0.45)' },
      '--dsw-alias-bg-layer-2': { light: '#D9CDA8', dark: 'rgba(16, 28, 48, 0.38)' },
      '--dsw-alias-bg-overlay': { light: 'rgba(244, 238, 218, 0.94)', dark: 'rgba(1, 10, 19, 0.9)' },
      '--dsw-alias-border-l1': { light: '#BFAE7F', dark: '#27313F' },
      '--dsw-alias-border-l2': { light: '#8C7340', dark: '#C8AA6E' },
      '--dsw-alias-brand-primary': { light: '#785A28', dark: '#C89B3C' },
      '--dsw-alias-label-primary': { light: '#1E2328', dark: '#F0E6D2' },
      '--dsw-alias-label-secondary': { light: '#6B5F45', dark: '#A09B8C' },
      '--dsw-alias-state-error-primary': { light: '#C4453C', dark: '#C4453C' },
      '--dsw-alias-state-success-primary': { light: '#0397AB', dark: '#0AC8B9' },
      '--dsw-alias-state-warn-primary': { light: '#B08D3F', dark: '#C8AA6E' },
      '--dsw-specific-sidebar-fill': { light: '#EAE2C8', dark: 'rgba(1, 10, 19, 0.35)' },
    }), 'lol-client: hextech palette')

    ctx.effect(() => styles.insert(CSS), 'lol-client: styles v5 windowed')

    const sessions = ctx.get('sessions')
    const workspaces = ctx.get('workspaces')
    const timer = ctx.get('timer')
    ctx.slots.inject('shell.overlay', () => ctx.slots.register(
      { name: 'shell.overlay', id: 'lol-client-lobby' },
      (props) => Lobby({ ...props, sessions, workspaces, timer }),
    ))
  },
}