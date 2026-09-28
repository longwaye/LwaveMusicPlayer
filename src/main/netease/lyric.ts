/**
 * 歌词模块
 * 对应 AlgerMusicPlayer 文档「2.2 歌曲/播放 — /lyric/new」
 * LWAVE 需求：联网搜索歌词（无本地上传歌词时兜底）
 */
import { httpGet } from './http'

export interface NeteaseLyric {
  lrc?: { lyric?: string; version?: number }
  klyric?: { lyric?: string }
  tlyric?: { lyric?: string }
  code: number
}

/** 按歌曲 id 获取歌词（含 lrc / 逐字 / 翻译） */
export function getLyric(id: number | string): Promise<NeteaseLyric> {
  return httpGet('/lyric/new', { id }) as Promise<NeteaseLyric>
}
