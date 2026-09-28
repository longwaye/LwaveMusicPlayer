import { app, BrowserWindow, protocol } from 'electron'
import { createReadStream, statSync } from 'fs'
import { Readable } from 'stream'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc'

/**
 * LWAVE·Player 主进程入口
 * 职责：应用生命周期、窗口创建、IPC 注册、本地媒体协议
 * 模块化：具体逻辑分散在 window/ 与 ipc/ 下
 */

// 自定义协议：lwfile:// 用于安全地把本地音频文件流式供给渲染层播放
// 必须在本模块顶层（app ready 之前）注册特权，才允许 fetch / stream
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'lwfile',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
  }
])

/** 根据扩展名返回音频 MIME 类型 */
function mimeOf(p: string): string {
  const ext = p.slice(p.lastIndexOf('.')).toLowerCase()
  const map: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.flac': 'audio/flac',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.opus': 'audio/ogg',
    '.aac': 'audio/aac'
  }
  return map[ext] || 'application/octet-stream'
}

// 单实例锁：避免重复打开
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // 第二实例激活时，聚焦已存在的主窗口
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    registerIpcHandlers()

    // 处理 lwfile:// 请求：把本地音频文件流式返回，支持 Range（seek / 时长）
    protocol.handle('lwfile', async (request) => {
      // 直接基于原始 URL 提取路径，避免 WHATWG URL 对 Windows 盘符冒号的剥离
      let filePath = decodeURIComponent(request.url.replace(/^lwfile:\/\//, ''))
      // Windows 盘符形态（单字母 + 斜杠，WHATWG 已剥掉冒号）=> 补回冒号
      if (process.platform === 'win32' && /^[a-zA-Z]\//.test(filePath)) {
        filePath = filePath[0] + ':' + filePath.slice(1)
      }
      try {
        const stat = statSync(filePath)
        const size = stat.size
        const ct = mimeOf(filePath)
        const range = request.headers.get('Range')
        if (range && /^bytes=/.test(range)) {
          const m = /bytes=(\d*)-(\d*)/.exec(range)
          const start = m && m[1] !== '' ? parseInt(m[1], 10) : 0
          const end = m && m[2] !== '' ? parseInt(m[2], 10) : size - 1
          const stream = Readable.toWeb(createReadStream(filePath, { start, end }))
          return new Response(stream, {
            status: 206,
            headers: {
              'Content-Type': ct,
              'Content-Length': String(end - start + 1),
              'Content-Range': `bytes ${start}-${end}/${size}`,
              'Accept-Ranges': 'bytes'
            }
          })
        }
        const stream = Readable.toWeb(createReadStream(filePath))
        return new Response(stream, {
          status: 200,
          headers: { 'Content-Type': ct, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' }
        })
      } catch (err) {
        console.error('[lwfile] 读取失败', filePath, err)
        return new Response('Not Found', { status: 404 })
      }
    })

    createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
