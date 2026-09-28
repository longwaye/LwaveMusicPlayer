import { contextBridge, ipcRenderer } from 'electron'
import { pathToFileURL } from 'url'

/**
 * 预加载脚本：安全桥接层
 * 通过 contextBridge 向渲染进程暴露受控 API，
 * 渲染进程不直接接触 Node/Electron，保证安全边界。
 */

export interface LocalSongEntry {
  name: string
  path: string
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

const api = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version')
  },
  music: {
    getDefaultPath: (): Promise<string> => ipcRenderer.invoke('music:get-default-path'),
    importFiles: (): Promise<ImportFilesResult> => ipcRenderer.invoke('music:import-files'),
    chooseLyrics: (): Promise<ChooseLyricsResult> => ipcRenderer.invoke('music:choose-lyrics'),
    // 把本地音频路径转换为 lwfile:// 播放 URL（基于标准 file URL，保证 Windows 盘符正确）
    toFileUrl: (p: string): string => pathToFileURL(p).toString().replace(/^file:\/\//, 'lwfile://')
  }
}

export type Api = typeof api

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // fallback：contextIsolation 关闭时挂到 window
  // @ts-ignore (仅当非隔离环境)
  window.api = api
}
