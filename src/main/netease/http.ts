/**
 * 网易云 API 通用请求封装（主进程侧，node 原生 http/https，零新依赖）
 *
 * 对应 AlgerMusicPlayer 文档「1. 通用请求约定」：
 * - 自动注入 timestamp（绕缓存）
 * - GET 参数走 query，POST 走 body + query
 * - 超时 15s
 * - 后端为本地 NeteaseCloudMusicApi 服务（baseURL 可配）
 *
 * baseURL：优先环境变量 LWAVE_NETEASE_API，否则默认本地 http://127.0.0.1:3000
 * （NeteaseCloudMusicApi 默认端口 3000；若自部署端口不同，用环境变量或改默认值）
 */

import * as http from 'http'
import * as https from 'https'

export const NETEASE_BASE = process.env.LWAVE_NETEASE_API || 'http://127.0.0.1:3000'

export interface NeteaseResponse {
  code: number
  [key: string]: unknown
}

function request(method: 'GET' | 'POST', path: string, params: Record<string, unknown> = {}): Promise<NeteaseResponse> {
  return new Promise((resolve, reject) => {
    const u = new URL(path, NETEASE_BASE)
    const q: Record<string, string> = { timestamp: String(Date.now()) }
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) q[k] = String(v)
    }
    if (method === 'GET') {
      for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v)
    }
    const lib = u.protocol === 'https:' ? https : http
    const req = lib.request(u, { method, timeout: 15000 }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        try {
          const text = Buffer.concat(chunks).toString('utf-8')
          resolve(JSON.parse(text) as NeteaseResponse)
        } catch (err) {
          reject(new Error('响应解析失败: ' + (err as Error).message))
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy(new Error('请求超时(15s): ' + path))
    })
    if (method === 'POST') {
      req.setHeader('Content-Type', 'application/json')
      req.write(JSON.stringify(q))
    }
    req.end()
  })
}

export const httpGet = (path: string, params?: Record<string, unknown>): Promise<NeteaseResponse> =>
  request('GET', path, params)
export const httpPost = (path: string, params?: Record<string, unknown>): Promise<NeteaseResponse> =>
  request('POST', path, params)
