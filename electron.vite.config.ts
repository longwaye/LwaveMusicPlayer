import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * electron-vite 构建配置
 * 三进程分离：main(主进程) / preload(预加载) / renderer(渲染进程)
 * 模块化约定：
 *  - src/main     Electron 主进程（窗口管理、IPC、系统能力）
 *  - src/preload  安全桥接层
 *  - src/renderer React 前端（功能按 features/ 分模块）
 */
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@features': resolve('src/renderer/src/features'),
        '@modes': resolve('src/renderer/src/modes'),
        '@shared': resolve('src/renderer/src/shared')
      }
    },
    plugins: [react()]
  }
})
