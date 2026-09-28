/**
 * 本地网易云 API 服务（自启模块）
 * 参考 AlgerMusicPlayer ①：应用启动时本地拉起 netease-cloud-music-api，
 * 数据走本地服务，无需依赖在线 API。渲染层经主进程 IPC 调用，无 CORS/CSP 问题。
 *
 * 端口策略：从 startPort 起尝试，被占自动 +1，最多试 10 个；失败不影响应用启动。
 */

import { serveNcmApi } from 'NeteaseCloudMusicApi'
import { createServer } from 'net'
import type { Server } from 'http'

let neteasePort = 0
let neteaseServer: Server | null = null

/** 检测本机端口是否空闲（127.0.0.1） */
function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const s = createServer()
    s.once('error', () => resolve(false))
    s.listen(port, '127.0.0.1', () => {
      s.close(() => resolve(true))
    })
  })
}

/** 等待 server 真正 listening；失败 / 超时返回 false */
function waitListening(server: Server): Promise<boolean> {
  if (server.listening) return Promise.resolve(true)
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup()
      resolve(false)
    }, 3000)
    const onErr = () => {
      cleanup()
      resolve(false)
    }
    const onList = () => {
      cleanup()
      resolve(true)
    }
    const cleanup = () => {
      clearTimeout(timer)
      server.off('error', onErr)
      server.off('listening', onList)
    }
    server.once('error', onErr)
    server.once('listening', onList)
  })
}

/** 启动本地网易云 API 服务，返回实际端口 */
export async function startNeteaseServer(startPort = 3000): Promise<number> {
  if (neteasePort > 0) return neteasePort
  for (let port = startPort; port < startPort + 10; port++) {
    if (!(await isPortFree(port))) continue
    try {
      const app = await serveNcmApi({ port, host: '127.0.0.1' })
      const server = (app?.server as Server | undefined)
      if (!server) continue
      const ok = await waitListening(server)
      if (ok) {
        neteasePort = port
        neteaseServer = server
        console.log(`[netease] 网易云 API 服务已启动 @ http://127.0.0.1:${port}`)
        return port
      }
      server.close()
    } catch (err) {
      console.warn(`[netease] 端口 ${port} 启动失败，尝试下一个`, (err as Error).message)
    }
  }
  throw new Error('启动网易云 API 服务失败：本地 3000-3009 端口均不可用')
}

/** 当前服务端口（未启动返回 0） */
export function getNeteasePort(): number {
  return neteasePort
}

/** 停止服务（应用退出时调用） */
export function stopNeteaseServer(): void {
  if (neteaseServer) {
    neteaseServer.close()
    neteaseServer = null
  }
  neteasePort = 0
}
