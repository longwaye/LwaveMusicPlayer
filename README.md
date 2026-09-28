# LWAVE·Player

简洁艺术化音乐播放器 · 兼容 macOS / Windows。

播放器本身就是一件"放映中的电影装置"：无论迷你模式、全屏歌词还是封面沉浸，都保持同一件艺术品的克制气质。

## 功能

- **三态展示**：封面沉浸 / 全屏歌词 / 迷你模式（预留骨架）
- **本地音乐**：手动导入本地音频文件（支持多选），导入列表持久化保留；默认下载位置显示在设置中
- **真实播放**：点击任意歌曲触发全局播放；播放 / 暂停、实时进度条与时长
- **歌词**：优先在已导入的本地歌曲中查找，未找到提示联网搜索（待实现）
- **收藏 / 播放列表 / 搜索 / 设置**：基础页面与交互

## 技术栈

- 桌面壳：Electron（main / preload / renderer 三进程）
- 前端：React 18 + TypeScript + Vite
- 构建：electron-vite

## 快速开始

```bash
npm install
npm run dev        # 开发（热更新）
npm run build      # 构建
npm run start      # 预览构建产物
npm run typecheck  # 类型检查
```

## 目录结构

```
LWAVE·Player/
├─ docs/                    # 需求与决策记录
├─ src/
│  ├─ main/                 # Electron 主进程
│  │  ├─ index.ts           #   入口：生命周期、lwfile:// 媒体协议
│  │  ├─ window/            #   窗口管理
│  │  └─ ipc/               #   IPC 通道（本地音乐导入 / 默认路径）
│  ├─ preload/              # 安全桥接层（contextBridge 暴露 window.api）
│  └─ renderer/
│     ├─ index.html
│     └─ src/
│        ├─ App.tsx         #   布局与页面路由
│        ├─ context/        #   AppContext（路由、播放、本地音乐、设置）
│        ├─ components/     #   侧栏、导航、图片占位、UI 组件
│        ├─ pages/          #   各功能页面（首页、搜索、本地音乐、设置等）
│        ├─ data/           #   演示歌曲 / 图片数据
│        └─ styles/         #   样式、主题、设计令牌
```

## 本地音频播放原理

本地音乐通过自定义 `lwfile://` 协议流式供渲染层播放，支持 Range 请求（进度条拖动、时长准确）；导入列表持久化在本地存储，重启后保留。
