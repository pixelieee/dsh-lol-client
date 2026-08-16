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

## 快速部署（先克隆到本机，再让助手安装）

**第 1 步：把仓库克隆到本机**（电脑上打开终端/命令行执行）：

```bash
git clone https://github.com/pixelieee/dsh-lol-client.git
```

不会用命令行的话，也可以在仓库页面点绿色的 **Code → Download ZIP**，解压到任意文件夹。

**第 2 步：把下面这段话复制发给 DeepSeek Harness 助手**（把「克隆到的路径」换成你刚才的位置）：

```text
请帮我安装一个英雄联盟客户端皮肤插件。

插件代码在我本机的「克隆到的路径\dsh-lol-client」文件夹里，有两个文件：
- plugin-host.js（后台代码）
- plugin-client.js（界面代码）

请这样做：
1. 用你的文件读取工具，读出这两个文件的完整内容。
   如果读不到这两个文件，请停下来告诉我，我会把文件内容粘贴给你 — 不要编造代码。
2. 用 cordis_define 创建插件：
   - kind: new，idPrefix 用 lolc
   - Host 代码 = plugin-host.js 的内容
   - Client 代码 = plugin-client.js 的内容
3. 用 cordis_run 启动；如果出现授权确认，请提示我点允许。
4. 启动成功后告诉我怎么用。
```

安装好之后，页面左下角会出现英雄联盟客户端的启动按钮，点击打开大厅。之后想停用/删除，在**设置 → 插件**面板里操作即可。

## 文件结构

```
├── plugin-client.js       界面代码（大厅、主题、壁纸、点击上报）
├── plugin-host.js         后台代码（接收点击上报 + 调试工具）
├── README.md              本文件
├── CHANGELOG.md           更新日志（从 v1 到 v5.7 的全部改动）
├── screenshots/           效果预览截图
└── docs/
    ├── implementation-notes.md     技术说明（英文）
    └── implementation-notes.zh.md  技术说明（中文）
```

## 许可

MIT — 见 [LICENSE](./LICENSE)。