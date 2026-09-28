import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

/**
 * 窗口管理模块
 */

const isDev = !!process.env['ELECTRON_RENDERER_URL']

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 120,
    show: false,
    title: 'LWAVE·Player',
    autoHideMenuBar: true,
    backgroundColor: '#0a0c12',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // 调试：捕获渲染进程 console 与崩溃信息，便于定位黑屏/白屏
  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    if (level >= 2) {
      console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`)
    }
  })
  win.webContents.on('render-process-gone', (_e, details) => {
    console.log('[renderer-gone]', details.reason)
  })
  win.webContents.on('did-fail-load', (_e, errorCode, errorDescription) => {
    console.log('[did-fail-load]', errorCode, errorDescription)
  })

  // 外部链接一律交给系统浏览器，不占用应用窗口
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] as string)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}
