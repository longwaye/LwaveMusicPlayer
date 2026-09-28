# LWAVE·Player 技术决策记录（ADR）

> 采用轻量 ADR 形式记录关键技术决策及其理由，供后续审阅与追溯。
> 状态：Proposed / Accepted / Deprecated

---

## ADR-001 桌面壳选用 Electron
- 状态：**Accepted**
- 决策：桌面形态采用 Electron（而非 Tauri）。
- 理由：需要系统媒体键、托盘、后台驻留、锁屏歌词等深度系统集成，Electron 的进程模型与生态更成熟；Tauri 需写 Rust 补系统能力，上手与维护成本更高。
- 权衡记录：Electron 包体大、内存占用高；若后续性能成为瓶颈可评估迁移 Tauri（前端 Web 技术栈可复用）。

## ADR-002 前端框架 React + Vite + TypeScript
- 状态：**Accepted**
- 决策：渲染进程使用 React 18 + Vite 5 + TypeScript。
- 理由：组件生态最全、类型安全、Vite 开发体验好；动画/音频可视化可配 GSAP + Web Audio API。

## ADR-003 三进程架构（electron-vite）
- 状态：**Accepted**
- 决策：main / preload / renderer 三进程分离，electron-vite 统一构建。
- 理由：职责清晰、便于模块化；contextIsolation + 无 nodeIntegration 保证安全边界。

## ADR-004 品牌命名 LWAVE·Player
- 状态：**Accepted**
- 决策：项目名与产品名定为 LWAVE·Player（用户拼音 longweiyi 取意）。
- 备选名（已提供，未采用）：朗微 / 蔚一 / 微忆 / 珑艺 / 浪微一。
- 理由：贴合"月光海 + 一轮月"的视觉主线，简洁有品牌感。

## ADR-005 视觉母题：电影静帧 · 三态一体
- 状态：**Accepted**（UI 样式后置落地）
- 决策：整个播放器以"月光海电影静帧"为统一视觉语言，三种展示模式（artwork / lyrics / compact）为同一件艺术品的不同切面。
- 理由：满足"简洁 + 极强艺术性 + 巧思 + 设计感"，拒绝常规堆砌式 UI。
- 实现提示：单一视觉源（共用背景艺术画与配色/字卡），GSAP 做三态镜头过渡，歌词用 Web Audio API 对时轴 + 字幕式滚动。

## ADR-006 渲染进程模块化目录
- 状态：**Accepted**
- 决策：前端按 `features/`（player / library / search / favorites / lyrics）+ `modes/` + `shared/` + `styles/` 组织。
- 理由：功能域内聚、可独立演进；后续新增功能只需加 feature 目录，不改主框架。

## ADR-007 采用 EMBER 2.0 设计规范
- 状态：**Accepted**
- 决策：LWAVE·Player 的视觉与交互系统整体采用《EMBER 2.0 设计规范》（"一本可以播放音乐的电影杂志"），替换此前"月光海电影静帧"的模糊方向，形成可执行的设计系统。
- 理由：用户提供完整规范（比例/气质/颜色/字体/组件/动画/无障碍），比口头方向更可落地、可回溯。
- 落地内容：
  - `styles/tokens.ts`：颜色（ASH/EMBER 双体系 + MAGMA 克制强调）、字体、字号、字距、动画帧数、胶片参数。
  - `styles/theme.ts`：五档温度主题（ASH/DUST/DUSK/EMBER/BLACK）+ 场景映射 + ThemeProvider。
  - `styles/index.css`：CSS 变量主题、排版、克制胶片质感（grain/vignette）、reduced-motion。
  - `components/`：EmberLogo、FilmFrame（16:10/3:2/4:3）、MagmaCore（呼吸播放键）、ProgressLine（地质时间轨迹）、FilmTexture。
- 命名说明：产品仍名为 LWAVE·Player；EMBER 是采用的设计语言与规范体系，非改名。

## ADR-008 胶片质感确定性实现
- 状态：**Accepted**
- 决策：胶片颗粒采用**预置 SVG 噪点纹理 + CSS 位移动画**，不逐帧调用 Math.random()。
- 理由：规范 42 节要求 Preview = Render，避免随机导致渲染不稳定；CSS transform/opacity 保证性能（规范 43 节）。
