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
/** localStorage 键：已导入的本地歌曲（重启后保留） */
const LS_LOCAL_SONGS = 'lwave.localSongs'
/** 把秒格式化为 mm:ss */
function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
interface AppContextValue {
  route: Route
  searchQuery: string
  navigate: (route: Route, searchQuery?: string) => void
  currentSong: string
  /** 播放歌曲：title 必填；本地歌曲可传 path 触发真实音频播放 */
  play: (title: string, path?: string) => void
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
  /** 播放 / 暂停切换 */
  togglePlay: () => void
  /** 当前播放时间（mm:ss） */
  currentTimeLabel: string
  /** 总时长（mm:ss） */
  durationLabel: string
}
const AppContext = createContext<AppContextValue | null>(null)
export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [route, setRoute] = useState<Route>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSong, setCurrentSong] = useState('The Big Ship')
  const [liked, setLiked] = useState(true)
  const [themeDark, setThemeDark] = useState(false)
  const [defaultMusicPath, setDefaultMusicPath] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  // 已导入的本地歌曲：从 localStorage 恢复（重启后保留）
  const [localSongs, setLocalSongs] = useState<LocalSong[]>(() => {
    try {
      const raw = localStorage.getItem(LS_LOCAL_SONGS)
      return raw ? (JSON.parse(raw) as LocalSong[]) : []
    } catch {
      return []
    }
  })
  // 全局唯一的音频播放器实例
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (!audioRef.current) audioRef.current = new Audio()
  const toastTimer = useRef<number | undefined>(undefined)
  // 持久化本地歌曲库
  useEffect(() => {
    try {
      localStorage.setItem(LS_LOCAL_SONGS, JSON.stringify(localSongs))
    } catch {
      /* 忽略写入失败 */
    }
  }, [localSongs])
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
  const play = useCallback((title: string, path?: string) => {
    setCurrentSong(title)
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
  // 手动导入本地音乐文件（多文件选择）
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
  const value = useMemo(
    () => ({
      route,
      searchQuery,
      navigate,
      currentSong,
      play,
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
      durationLabel: fmt(duration)
    }),
    [route, searchQuery, navigate, currentSong, play, liked, toggleLike, themeDark, toggleTheme, toast, defaultMusicPath, localSongs, importLocalFiles, isPlaying, currentTime, duration, togglePlay]
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
