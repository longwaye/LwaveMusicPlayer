/**
 * 歌曲模块
 * 对应 AlgerMusicPlayer 文档「2.2 歌曲/播放 — /song/detail、/song/url/v1」
 * LWAVE 需求：云歌曲详情与播放链接（接入网易云曲库时使用；当前本地播放为主，备用）
 */
import { httpGet } from './http'

export type NeteaseLevel =
  | 'standard' // 128k
  | 'higher' // 320k（默认）
  | 'exhigh'
  | 'lossless' // 无损 flac
  | 'hires'
  | 'jyeffect'
  | 'sky'
  | 'dolby'
  | 'jymaster'

export interface NeteaseSongDetail {
  songs?: {
    id: number
    name: string
    ar?: { id: number; name: string }[]
    al?: { id: number; name: string; picUrl?: string }
    dt?: number
    year?: number
  }[]
  code: number
}

export interface NeteaseSongUrl {
  data?: { id: number; url?: string; br?: number; size?: number; freeTrialInfo?: unknown }[]
  code: number
}

/** 歌曲详情（ids 逗号拼接，支持批量） */
export function getSongDetail(ids: string | number | (string | number)[]): Promise<NeteaseSongDetail> {
  const idStr = Array.isArray(ids) ? ids.join(',') : String(ids)
  return httpGet('/song/detail', { ids: idStr }) as Promise<NeteaseSongDetail>
}

/** 播放链接（默认 higher=320k；lossless 及以上走 flac） */
export function getSongUrl(id: number | string, level: NeteaseLevel = 'higher'): Promise<NeteaseSongUrl> {
  return httpGet('/song/url/v1', { id, level }) as Promise<NeteaseSongUrl>
}
