import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/** 应用路由 */
export type Route =
  | 'home'
  | 'search'
  | 'library'
  | 'favorites'
  | 'playlists'
  | 'playlist-detail'
  | 'album'
  | 'notes'
  | 'settings'

/** 本地歌曲 */
export interface LocalSong {
  name: string
  path: string
  lyrics?: string
}

/** localStorage 键 */
const LS_LOCAL_SONGS = 'lwave.localSongs'
const LS_LYRICS = 'lwave.lyrics'

/** 把秒格式化为 mm:ss */
function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** 解析歌词：去除 [mm:ss.xx] 时间戳，保留歌词文本 */
export function stripLyricTime(content: string): string {
  if (!content) return ''
  return content
    .split('\n')
    .map((l) => l.replace(/\[[^\]]*\]/g, '').trim())
    .filter(Boolean)
    .join('\n')
}

interface AppContextValue {
  route: Route
  searchQuery: string
  navigate: (route: Route, searchQuery?: string) => void
  currentSong: string
  /** 当前播放歌曲的歌手（跟随切歌） */
  currentArtist: string
  /** 当前播放歌曲的本地路径（无则内置曲目） */
  currentPath?: string
  /** 播放歌曲：本地歌曲传 path 触发真实音频；内置歌曲传 artist 用于歌手展示 */
  play: (title: string, path?: string, artist?: string) => void
  /** 从本地音乐中删除某首歌（移除记录；若正在播放则停止） */
  removeLocalSong: (path: string) => void
  liked: boolean
  toggleLike: () => void
  themeDark: boolean
  toggleTheme: () => void
  toast: (message: string) => void
  /** 本地音乐默认下载位置 */
  defaultMusicPath: string
  /** 已导入的本地歌曲（持久化） */
  localSongs: LocalSong[]
  /** 手动导入本地音乐文件（主进程弹出多文件选择） */
  importLocalFiles: () => Promise<void>
  /** 播放状态 */
  isPlaying: boolean
  currentTime: number
  duration: number
  togglePlay: () => void
  currentTimeLabel: string
  durationLabel: string
  /** 音量 0–1 */
  volume: number
  setVolume: (v: number) => void
  /** 歌词库：按歌曲名存储（持久化） */
  lyricsBySong: Record<string, string>
  /** 为当前歌曲上传本地歌词（.lrc / .txt） */
  attachLyrics: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [route, setRoute] = useState<Route>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSong, setCurrentSong] = useState('The Big Ship')
  const [currentArtist, setCurrentArtist] = useState('Brian Eno')
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined)
  const [liked, setLiked] = useState(true)
  const [themeDark, setThemeDark] = useState(false)
  const [defaultMusicPath, setDefaultMusicPath] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volumeState, setVolumeState] = useState(0.7)

  // 已导入的本地歌曲：从 localStorage 恢复
  const [localSongs, setLocalSongs] = useState<LocalSong[]>(() => {
    try {
      const raw = localStorage.getItem(LS_LOCAL_SONGS)
      return raw ? (JSON.parse(raw) as LocalSong[]) : []
    } catch {
      return []
    }
  })

  // 歌词库：从 localStorage 恢复
  const [lyricsBySong, setLyricsBySong] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(LS_LYRICS)
      return raw ? (JSON.parse(raw) as Record<string, string>) : {}
    } catch {
      return {}
    }
  })

  // 全局唯一的音频播放器实例
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (!audioRef.current) {
    audioRef.current = new Audio()
    audioRef.current.volume = volumeState
  }
  const toastTimer = useRef<number | undefined>(undefined)

  // 持久化本地歌曲库与歌词库
  useEffect(() => {
    try {
      localStorage.setItem(LS_LOCAL_SONGS, JSON.stringify(localSongs))
      localStorage.setItem(LS_LYRICS, JSON.stringify(lyricsBySong))
    } catch {
      /* 忽略写入失败 */
    }
  }, [localSongs, lyricsBySong])

  // 初始化本地音乐默认下载位置
  useEffect(() => {
    let alive = true
    window.api.music
      .getDefaultPath()
      .then((p) => { if (alive && p) setDefaultMusicPath(p) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // 监听音频进度 / 结束
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => { setCurrentTime(a.currentTime); setDuration(a.duration || 0) }
    const onMeta = () => { setDuration(a.duration || 0) }
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0) }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  const navigate = useCallback((r: Route, q = '') => {
    setRoute(r)
    setSearchQuery(q)
  }, [])

  const play = useCallback((title: string, path?: string, artist?: string) => {
    setCurrentSong(title)
    setCurrentPath(path)
    setCurrentArtist(artist || '未知歌手')
    const a = audioRef.current
    if (!a) return
    if (path) {
      // 本地歌曲：真实播放
      a.src = window.api.music.toFileUrl(path)
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    } else {
      // 内置曲目：无本地文件，仅切换标题并停止当前音频
      a.pause()
      a.removeAttribute('src')
      setIsPlaying(false)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a || !a.getAttribute('src')) return
    if (a.paused) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      a.pause()
      setIsPlaying(false)
    }
  }, [])

  const setVolume = useCallback((v: number) => {
    const vol = Math.max(0, Math.min(1, v))
    setVolumeState(vol)
    const a = audioRef.current
    if (a) a.volume = vol
  }, [])

  const toggleLike = useCallback(() => setLiked((v) => !v), [])
  const toggleTheme = useCallback(() => setThemeDark((v) => !v), [])

  const toast = useCallback((message: string) => {
    const el = document.querySelector('.toast')
    if (!el) return
    el.textContent = message
    el.classList.add('show')
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => el.classList.remove('show'), 1500)
  }, [])

  // 手动导入本地音乐文件
  const importLocalFiles = useCallback(async () => {
    try {
      const res = await window.api.music.importFiles()
      if (res.canceled) return
      if (res.songs.length) {
        setLocalSongs((prev) => {
          const merged = [...prev]
          for (const s of res.songs) {
            if (!merged.some((m) => m.path === s.path)) merged.push({ name: s.name, path: s.path })
          }
          return merged
        })
        toast(`已导入 ${res.songs.length} 首本地歌曲`)
      } else {
        toast('未选择音频文件')
      }
    } catch {
      toast('导入失败')
    }
  }, [toast])

  // 删除本地音乐记录（若当前正在播放该歌则停止并回到默认曲目）
  const removeLocalSong = useCallback((path: string) => {
    setLocalSongs((prev) => prev.filter((s) => s.path !== path))
    if (currentPath === path) {
      const a = audioRef.current
      if (a) {
        a.pause()
        a.removeAttribute('src')
      }
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      setCurrentSong('The Big Ship')
      setCurrentArtist('Brian Eno')
      setCurrentPath(undefined)
    }
  }, [currentPath])

  // 为当前歌曲上传本地歌词
  const attachLyrics = useCallback(async () => {
    try {
      const res = await window.api.music.chooseLyrics()
      if (res.canceled) return
      if (res.content.trim()) {
        setLyricsBySong((prev) => ({ ...prev, [currentSong]: res.content }))
        toast('歌词已添加')
      } else {
        toast('歌词文件为空')
      }
    } catch {
      toast('读取歌词失败')
    }
  }, [currentSong, toast])

  const value = useMemo(
    () => ({
      route,
      searchQuery,
      navigate,
      currentSong,
      currentArtist,
      currentPath,
      play,
      removeLocalSong,
      liked,
      toggleLike,
      themeDark,
      toggleTheme,
      toast,
      defaultMusicPath,
      localSongs,
      importLocalFiles,
      isPlaying,
      currentTime,
      duration,
      togglePlay,
      currentTimeLabel: fmt(currentTime),
      durationLabel: fmt(duration),
      volume: volumeState,
      setVolume,
      lyricsBySong,
      attachLyrics
    }),
    [route, searchQuery, navigate, currentSong, currentArtist, currentPath, play, removeLocalSong, liked, toggleLike, themeDark, toggleTheme, toast, defaultMusicPath, localSongs, importLocalFiles, isPlaying, currentTime, duration, togglePlay, volumeState, setVolume, lyricsBySong, attachLyrics]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
