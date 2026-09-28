# LWAVE·Player 需求记录（REQUIREMENTS）

> 本文件用于固化与用户的每一次对话确认，方便后续回溯与实现。
> 每条记录附带「确认时间 / 状态」，新增需求请追加，勿覆盖历史。

---

## R1. 产品定位（已确认）
- **形态**：桌面音乐播放软件，兼容 **macOS + Windows**。
- **命名**：**LWAVE·Player**（由用户拼音 longweiyi 取意，对应"月光之浪"）。
- **一句话定位**：一件"放映中的电影装置"，无论何种展示模式都像一幅艺术品画或电影静帧。

## R2. 技术选型（已确认）
- 桌面壳：**Electron**（主进程多进程模型、系统媒体键/托盘等深度集成较成熟）。
- 前端：**React + Vite + TypeScript**，electron-vite 三进程架构（main / preload / renderer）。
- 构建工具：electron-vite。

## R3. 视觉方向（已确认，UI 具体样式后置）
- **美学母题**：月光海电影静帧 / 艺术画，低饱和褪色靛蓝 + 暖灰 + 银白，细腻胶片颗粒，克制衬线字卡。
- **设计原则**：简洁、极强艺术性、有巧思、有设计感；拒绝俗气渐变、玻璃拟态堆砌、图标堆砌。
- **三态一体**：整个播放器是同一件艺术品的不同切面，共享同一视觉语言：
  | 模式 | 概念 |
  |---|---|
  | artwork 封面沉浸 | 一幅可以长久凝视的电影静帧 / 艺术画，控件几乎隐形 |
  | lyrics 全屏歌词 | 背景艺术画压暗，歌词化作电影字幕逐行浮现 |
  | compact 迷你 | 缩成一枚"电影胶片帧"，本身就是一件微型装置 |

## R4. 功能规划（已确认需求项，具体实现待排期）
- 播放控制：播放 / 暂停、上一曲 / 下一曲、进度条、音量。
- **收藏**（Favorites）。
- **歌词**（Lyrics，字幕式滚动，需 LRC 对时轴）。
- **搜索**（Search）。
- 曲库 / 播放列表（Library / Playlist）。
- 三态模式切换：compact / lyrics / artwork。

## R5. 架构要求（已确认）
- **模块化**，功能按 feature 分目录，方便后续修改与扩展。
- UI 样式后置：当前先搭可运行的模块化框架，样式后续按 R3 替换。
- 需求与决策需固化到 docs/（本文件与 DECISIONS.md）。

## R6. 设计规范：采用 EMBER 2.0（已确认）
用户提供《EMBER 2.0 中文完整设计规范》，要求按其理念、思路、规范落地。

- **核心概念**：EMBER = 余烬。产品是"**一本可以播放音乐的电影杂志**"，不是火山主题 App，也不是普通音乐播放器。
- **比例**：60% 电影感 + 20% 编辑设计 + 10% 音乐感 + 10% 火山隐喻。
- **气质**：cinematic / editorial / analog / poetic / quiet / warm / literary / minimal / natural / timeless / human / tactile。
- **避免**：Cyberpunk / Neon / Glassmorphism / Dashboard / SaaS UI / 卡片矩阵 / 大量圆角 / 渐变发光 / 科技蓝 / 高饱和火焰 / 传统音乐 App 布局 / 大型 Audio Visualizer。
- **主题**：非普通浅/深，而是一条温度变化 `ASH → DUST → DUSK → EMBER → BLACK`；ASH 为默认浅色主主题（非纯白），黑色成为"电影中的阴影"，橙色只做"黑暗里的一颗火星"。
- **字体**：标题 Cormorant Garamond（备用 Bodoni Moda / DM Serif / Libre Baskerville）；UI 用 Inter（备用 IBM Plex / Helvetica Neue）。
- **核心交互组件**：
  - 播放键 = **Magma Core**（呼吸的圆，替代传统 ▶；Playing 轻微缩放发光，Paused 停止呼吸）。
  - 进度条 = **Geological Time Trace**（极细、不规则、像地震记录/胶片时间线；Played 用 MAGMA）。
  - 胶片质感 = 克制（Grain 0.018–0.035 / Vignette 很淡），像真实胶片而非套滤镜。
  - 音频响应：只能轻微影响 UI（界面"呼吸"），绝不做传统 Visualizer。
- **页面**：Home 像电影静帧、Now Playing 像胶片章节、Library 像音乐杂志目录、Album 像唱片封套、Journeys 像旅行日志、Field Notes 像自然观察手记、Menu 像电影章节目录、Settings 像编辑出版物参数页。
- **动画**：Slow / Soft / Organic / Breathing / Drifting / Fading / Revealing；避免 Bounce / Elastic / Overshoot / Fast Zoom / Glitch。
- **图片**：像真实电影静帧，低饱和（-10%~-25%），尤推荐 "Tiny Human × Huge Nature"；不每张都出现火山。
- **品牌文案**：主标语 LISTEN DEEPLY. / A MUSIC PLAYER THAT FEELS LIKE A FILM.
- **无障碍**：高对比、键盘导航、Focus 状态、Reduced Motion、不依赖颜色表达唯一状态。
- **原则**：Remove Before Adding（复杂时先删元素而非加动画）；高级感来自比例/留白/字体/材质/节奏/克制，而非 3D/玻璃/金色/阴影/渐变/发光。

## R7. 视觉校准：参考 EMBER 风格展示图（已确认）
用户提供《EMBER 2.0 风格展示图》，作为落地实现的视觉基准，已完成校准：

- **配色**：向更暖的大地色系调整 —— warmWhite `#F7E0D1`、magma `#B85C25`、fire `#E0623A`、warmLight `#DDA54F`、earth `#945A3C`（已同步 tokens.ts 与 index.css）。
- **电影静帧背景层**：新增 CinematicBackdrop 组件 —— 每页背景为暖调低饱和电影风景，支持真实电影图 src 与暖调渐变占位，统一做低饱和/压暗/暖色校正，压暗随主题（ASH→EMBER）变化。
- **Now Playing 时间码**：标题下方显示 03:17 / 05:47 时间码。
- **中文标语**：底部品牌区加入"倾听 · 深入 · 感受"（LISTEN DEEPLY 的中文版）。
- **待办（后续）**：转场系统（Film Burn / Smoke / Film Gate / Cooling，规范 23–25 节）；真实电影图资源接入；本地字体打包（Cormorant Garamond + Inter）。

---

## 变更日志
| 时间 | 变更 |
|---|---|
| 2026-09-28 | 初始化：确认 R1–R5，搭建 electron-vite + React + TS 模块化框架 |
| 2026-09-28 | 采纳 R6：采用 EMBER 2.0 设计规范，落地 design tokens / 主题系统 / 全局样式 / 核心组件骨架 |
| 2026-09-28 | 校准 R7：参考 EMBER 风格展示图，暖调配色 / 电影背景层 / 时间码 / 中文标语 |
