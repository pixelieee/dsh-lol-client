# lol-client — DeepSeek Harness 英雄联盟客户端复刻

给 [DeepSeek Harness](https://github.com/topics/deepseek-harness) 的 Web GUI 换上高保真《英雄联盟》客户端复刻界面。动态 Cordis 插件，双半实现（Client + Host），全部走既有扩展点（theme token / `shell.overlay`），不改动宿主框架。

## 效果预览

**窗口化登录大厅**

![窗口化登录大厅](screenshots/screenshot-client-lobby.png)

**对局页 + 英雄池**

![对局页与英雄池](screenshots/screenshot-play-champions.png)

**最小化 + 跟随英雄的整页壁纸**

![最小化与壁纸](screenshots/screenshot-minimized-wallpaper.png)

## 特性

- **窗口化登录大厅**：居中浮动窗口，可拖动、双击居中、最小化为右下角启动器；窗口外 DSH 对话页始终可见可操作。
- **LCU 布局复刻**：顶部导航（主页/对局/英雄/藏品/商城/战利品/设置）、社交栏（会话=好友、工作区=战队）、底部召唤师信息条（等级/经验/精粹/点券）。
- **真实英雄原画**：21 名英雄池 + hero 轮播 + 商城皮肤，素材来自 Riot 官方 ddragon splash CDN，离线自动降级为首字母卡牌。
- **选英雄即换壁纸**：整页背景跟随当前所选英雄（React `<style>` 动态渲染，深色氛围渐变保证文字可读）。
- **动作真实落账**：开始对局/开始排位 → 真正创建并切入新智能体会话；进入战队 → `connectWorkspace` 打开工作区会话；全部动作带金色 toast 反馈。
- **DOM 自检**：点击命中 + 2s 状态快照经私有 RPC 上报 Host，注册动态 Tool `lolc_dom_report`，模型无需截图即可验证真实交互。

## 快速安装

通过 DSH 动态 Cordis 插件机制注入：

1. 在 DSH Web GUI 打开插件定义（`cordis_define`）：
   - **Host 半** → `plugin-host.js` 全文
   - **Client 半** → `plugin-client.js` 全文
2. `cordis_run` 激活（首次 Client 激活需在界面批准）。
3. 停用 `cordis_stop(lolc-1)`；移除 `cordis_undefine(lolc-1)`。

要求 DSH 提供 `theme.overrideTokens`、`shell.overlay` 列表 slot、`sessions` / `workspaces` / `timer` 可选服务（均为 DSH 标准能力）。

## 文件结构

```
├── plugin-client.js       Client 半源码（窗口化大厅、主题、壁纸、自检上报）
├── plugin-host.js         Host 半源码（RPC 接收器 + lolc_dom_report 工具）
├── README.md              本文件
├── CHANGELOG.md           版本演变日志（v1 → v5.7）
├── screenshots/           效果预览截图
└── docs/
    ├── implementation-notes.md     架构决策记录（英文）
    └── implementation-notes.zh.md  架构决策记录（中文）
```

## 许可

MIT — 见 [LICENSE](./LICENSE)。