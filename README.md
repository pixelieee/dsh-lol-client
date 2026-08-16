# lol-client — 英雄联盟客户端皮肤（DeepSeek Harness 专用）

让 DeepSeek Harness 的网页界面变成英雄联盟客户端的模样：登录大厅、英雄池、对局页、商城全都有，点按钮还能真的创建对话/工作区。装好后整个工具看起来就是个联盟客户端，但背后还是 DeepSeek Harness 在工作。

## 效果预览

![最小化与壁纸](screenshots/screenshot-minimized-wallpaper.png)

![窗口化登录大厅](screenshots/screenshot-client-lobby.png)

![对局页与英雄池](screenshots/screenshot-play-champions.png)

## 它能干什么

- **像联盟客户端一样的大厅**：一个能拖动、能最小化的窗口，里面是完整的客户端界面（主页/对局/英雄/商城/设置等 7 个页面）。
- **用真英雄原画**：21 个英雄、主页轮播、商城皮肤，图片都来自拳头官方资源；断网时自动换成首字母卡片，不会裂图。
- **选谁换谁**：在英雄页点一个英雄，整个页面背景就换成这位英雄的原画。
- **操作是真的**：点「开始对局」「开始排位」会真正新建一个智能体能用的对话；点「进入战队」会打开对应工作区；每个操作都有金色提示条反馈。
- **自带体检**：记录每次点击并上报，方便调试时确认按钮真的响应了。

## 快速部署（照着做，2 分钟）

1. 打开 DeepSeek Harness 网页界面，进入**插件**面板。
2. 新建插件，选「已有插件」输入 `lolc-1`（或直接新建也行）。
3. **第一个框（后端/工具代码）**：把 `plugin-host.js` 的全部内容复制粘贴进去。
4. **第二个框（前端界面代码）**：把 `plugin-client.js` 的全部内容复制粘贴进去。
5. 点**运行/启用**，界面弹出的授权确认点允许。
6. 完成——页面左下角会出现英雄联盟客户端的启动按钮，点击打开大厅。

停用：插件面板里点停止（`cordis_stop`）；彻底删除：点移除（`cordis_undefine`）。

## 文件结构

```
├── plugin-client.js       界面代码（大厅、主题、壁纸、点击上报）—— 粘贴到前端框
├── plugin-host.js         后台代码（接收点击上报 + 调试工具）—— 粘贴到后端框
├── README.md              本文件
├── CHANGELOG.md           更新日志（从 v1 到 v5.7 的全部改动）
├── screenshots/           效果预览截图
└── docs/
    ├── implementation-notes.md     技术说明（英文）
    └── implementation-notes.zh.md  技术说明（中文）
```

## 许可

MIT — 见 [LICENSE](./LICENSE)。