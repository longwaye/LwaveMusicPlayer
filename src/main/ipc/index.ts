import { ipcMain, dialog, app } from 'electron'
import { basename } from 'path'

/**
 * IPC 通道注册模块
 * 规范：渲染进程通过 preload 暴露的安全 API 与主进程通信。
 * 每个业务域新增一个 registerXxx 函数，集中在此挂载，保持主进程逻辑清晰可维护。
 */

/** 支持的本地音频扩展名 */
const AUDIO_EXTS = ['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac', '.opus']

/** 导入结果（渲染进程用） */
export interface LocalSongEntry {
  name: string
  path: string
}

export interface ImportFilesResult {
  canceled: boolean
  songs: LocalSongEntry[]
}

/** 从文件名剥离扩展名 */
function stripExt(fileName: string): string {
  const i = fileName.lastIndexOf('.')
  return i > 0 ? fileName.slice(0, i) : fileName
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

  // 手动导入：选择音频文件（可多选），返回文件信息
  'music:import-files': async (): Promise<ImportFilesResult> => {
    const res = await dialog.showOpenDialog({
      title: '导入本地音乐',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '音频文件', extensions: AUDIO_EXTS.map((e) => e.slice(1)) }]
    })
    if (res.canceled || res.filePaths.length === 0) {
      return { canceled: true, songs: [] }
    }
    const songs = res.filePaths
      .filter((p) => AUDIO_EXTS.some((x) => p.toLowerCase().endsWith(x)))
      .map((p) => ({ name: stripExt(basename(p)), path: p }))
    return { canceled: false, songs }
  }
} as const

export function registerIpcHandlers(): void {
  for (const [channel, handler] of Object.entries(channels)) {
    ipcMain.handle(channel, (_event, ...args) => (handler as (...a: unknown[]) => unknown)(...args))
  }
}
