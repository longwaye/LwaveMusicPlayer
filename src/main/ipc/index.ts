import { ipcMain, dialog, app } from 'electron'
import { basename } from 'path'
import { readFileSync } from 'fs'
import JsMediaTags from 'jsmediatags'

/**
 * IPC 通道注册模块
 * 规范：渲染进程通过 preload 暴露的安全 API 与主进程通信。
 * 每个业务域新增一个 registerXxx 函数，集中在此挂载，保持主进程逻辑清晰可维护。
 */

/** 支持的本地音频扩展名 */
const AUDIO_EXTS = ['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac', '.opus']

/** 导入结果（渲染进程用）：含音频元数据（艺术家 / 年份） */
export interface LocalSongEntry {
  name: string
  path: string
  artist?: string
  year?: string
}

export interface ImportFilesResult {
  canceled: boolean
  songs: LocalSongEntry[]
}

export interface ChooseLyricsResult {
  canceled: boolean
  name: string
  content: string
}

/** 从文件名剥离扩展名 */
function stripExt(fileName: string): string {
  const i = fileName.lastIndexOf('.')
  return i > 0 ? fileName.slice(0, i) : fileName
}

/** 从文件名截取标题：去掉 " - 歌手" / " / 歌手" 等后缀段 */
function cleanTitle(raw: string): string {
  return raw.split(/\s*[–—-]\s*|\s*\/\s*|\s*\|\s*/)[0].trim()
}

/** 读取音频文件内嵌元数据（标题 / 艺术家 / 年份），失败时返回空 */
function readAudioMeta(path: string): Promise<{ title?: string; artist?: string; year?: string }> {
  return new Promise((resolve) => {
    try {
      new JsMediaTags.Reader(path).read({
        onSuccess: (tag) => {
          const t = tag.tags
          resolve({
            title: typeof t.title === 'string' && t.title ? t.title : undefined,
            artist: typeof t.artist === 'string' && t.artist ? t.artist : undefined,
            year: t.year !== undefined && t.year !== null && t.year !== '' ? String(t.year) : undefined
          })
        },
        onError: () => resolve({})
      })
    } catch {
      resolve({})
    }
  })
}

// 应用基础信息 + 本地音乐
const channels = {
  'app:get-version': (): string => process.env['npm_package_version'] || '0.0.0',

  // 本地音乐默认下载位置
  'music:get-default-path': (): string => {
    try {
      return app.getPath('music')
    } catch {
      return app.getPath('home')
    }
  },

  // 手动导入：选择音频文件（可多选），读取内置元数据（艺术家 / 年份）
  'music:import-files': async (): Promise<ImportFilesResult> => {
    const res = await dialog.showOpenDialog({
      title: '导入本地音乐',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '音频文件', extensions: AUDIO_EXTS.map((e) => e.slice(1)) }]
    })
    if (res.canceled || res.filePaths.length === 0) {
      return { canceled: true, songs: [] }
    }
    const songs: LocalSongEntry[] = []
    for (const p of res.filePaths) {
      if (!AUDIO_EXTS.some((x) => p.toLowerCase().endsWith(x))) continue
      let title: string | undefined
      let artist: string | undefined
      let year: string | undefined
      try {
        const meta = await readAudioMeta(p)
        title = meta.title
        artist = meta.artist
        year = meta.year
      } catch {
        // 无元数据时回退到文件名
      }
      // 标题：优先内嵌 title，否则用文件名截取标题段（去掉歌手段）
      const name = (title && title.trim()) || cleanTitle(stripExt(basename(p)))
      songs.push({ name, path: p, artist, year })
    }
    return { canceled: false, songs }
  },

  // 选择歌词文件（.lrc / .txt），返回内容
  'music:choose-lyrics': async (): Promise<ChooseLyricsResult> => {
    const res = await dialog.showOpenDialog({
      title: '选择歌词文件',
      properties: ['openFile'],
      filters: [{ name: '歌词文件', extensions: ['lrc', 'txt'] }]
    })
    if (res.canceled || res.filePaths.length === 0) {
      return { canceled: true, name: '', content: '' }
    }
    const p = res.filePaths[0]
    let content = ''
    try {
      content = readFileSync(p, 'utf-8')
    } catch (err) {
      console.error('[music:choose-lyrics] 读取失败', err)
    }
    return { canceled: false, name: basename(p), content }
  }
} as const

export function registerIpcHandlers(): void {
  for (const [channel, handler] of Object.entries(channels)) {
    ipcMain.handle(channel, (_event, ...args) => (handler as (...a: unknown[]) => unknown)(...args))
  }
}
