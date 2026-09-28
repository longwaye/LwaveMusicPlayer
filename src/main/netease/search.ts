/**
 * 搜索模块
 * 对应 AlgerMusicPlayer 文档「2.5 搜索 — /cloudsearch」
 * LWAVE 需求：按关键词搜索网易云曲库（默认单曲 type=1），后续可扩展专辑/歌手
 */
import { httpGet } from './http'

export type NeteaseSearchType = 1 | 10 | 100 | 1000 | 1004 | 1009
// 1 单曲 | 10 专辑 | 100 歌手 | 1000 歌单 | 1004 MV | 1009 电台

export interface NeteaseSearchResult {
  result?: {
    songs?: {
      id: number
      name: string
      artists?: { id: number; name: string }[]
      album?: { id: number; name: string; picUrl?: string }
      duration?: number
    }[]
    songCount?: number
  }
  code: number
}

export interface SearchParams {
  keywords: string
  type?: NeteaseSearchType
  limit?: number
  offset?: number
}

/** 综合搜索 */
export function search(params: SearchParams): Promise<NeteaseSearchResult> {
  return httpGet('/cloudsearch', {
    keywords: params.keywords,
    type: params.type ?? 1,
    limit: params.limit ?? 30,
    offset: params.offset ?? 0
  }) as Promise<NeteaseSearchResult>
}

/** 按关键词搜单曲（常用便捷入口） */
export function searchSongs(keywords: string, limit = 30): Promise<NeteaseSearchResult> {
  return search({ keywords, type: 1, limit })
}
