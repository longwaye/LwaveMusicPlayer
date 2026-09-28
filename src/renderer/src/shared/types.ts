/**
 * 共享领域类型
 */
/** 歌曲 */
export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration?: number
  coverUrl?: string
  audioSrc?: string
  lrc?: string
}

export {}
