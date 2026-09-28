/**
 * 下载模块：把网易云歌曲 / 歌词下载到系统音乐目录（右键菜单用）
 * 歌曲：经 songUrl 取播放链接后流式下载（跟随重定向）
 * 歌词：经 lyric/new 取 lrc 文本后写 .lrc 文件
 */
import { app } from 'electron'
import { createWriteStream, writeFileSync } from 'fs'
import { join } from 'path'
import * as http from 'http'
import * as https from 'https'
import { getSongUrl } from './song'
import { getLyric } from './lyric'

/** 清理文件名的非法字符 */
function sanitize(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'untitled'
}

/** 流式下载（跟随重定向），成功返回 true */
function downloadTo(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const lib = url.startsWith('https://') ? https : http
    const req = lib.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        req.destroy()
        downloadTo(res.headers.location, dest).then(resolve)
        return
      }
      if (!res.statusCode || res.statusCode !== 200) {
        res.resume()
        resolve(false)
        return
      }
      const w = createWriteStream(dest)
      res.pipe(w)
      w.on('finish', () => {
        w.close()
        resolve(true)
      })
      w.on('error', () => {
        resolve(false)
        req.destroy()
      })
    })
    req.on('error', () => resolve(false))
    req.setTimeout(20000, () => req.destroy())
  })
}

/** 下载歌曲到系统音乐目录，返回文件路径 */
export async function downloadSong(id: number | string, name: string): Promise<{ ok: boolean; path?: string }> {
  try {
    const res = await getSongUrl(id)
    const url = res?.data?.[0]?.url
    if (!url) return { ok: false }
    const dir = app.getPath('music')
    const ext = url.includes('.flac') ? '.flac' : '.mp3'
    const path = join(dir, `${sanitize(name)}${ext}`)
    const ok = await downloadTo(url, path)
    return { ok, path }
  } catch {
    return { ok: false }
  }
}

/** 下载歌词（.lrc）到系统音乐目录 */
export async function downloadLyric(id: number | string, name: string): Promise<{ ok: boolean; path?: string }> {
  try {
    const res = await getLyric(id)
    const text = res?.lrc?.lyric
    if (!text) return { ok: false }
    const dir = app.getPath('music')
    const path = join(dir, `${sanitize(name)}.lrc`)
    writeFileSync(path, text, 'utf-8')
    return { ok: true, path }
  } catch {
    return { ok: false }
  }
}
