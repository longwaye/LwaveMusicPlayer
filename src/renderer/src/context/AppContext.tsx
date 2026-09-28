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

/** 本地歌曲（含音频元数据：艺术家 / 年份） */
export interface LocalSong {
  name: string
  path: string
  artist?: string
  album?: string
  year?: string
  lyrics?: string
}

/** 播放队列项：播放过的歌曲（最新在前，去重） */
export interface QueueItem {
  name: string
  artist: string
  path?: string
}

/** 收藏歌曲项（key 为唯一标识，云歌用 n+neteaseId，避免同名歌曲联动） */
export interface LikedSong {
  name: string
  artist: string
  path?: string
  key?: string
}

/** localStorage 键 */
const LS_LOCAL_SONGS = 'lwave.localSongs'
const LS_LYRICS = 'lwave.lyrics'
const LS_LIKED = 'lwave.likedSongs'

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
  currentAlbum: string
  /** 当前播放歌曲的本地路径（无则内置曲目） */
  currentPath?: string
  /** 播放歌曲：本地歌曲传 path 触发真实音频；内置歌曲传 artist 用于歌手展示 */
  play: (title: string, path?: string, artist?: string, album?: string) => void
  /** 从本地音乐中删除某首歌（移除记录；若正在播放则停止） */
  removeLocalSong: (path: string) => void
  /** 收藏的歌曲（持久化） */
  likedSongs: LikedSong[]
  /** 收藏 / 取消收藏当前播放歌曲 */
  toggleLike: () => void
  /** 从收藏中移除指定歌曲 */
  removeLiked: (name: string) => void
  /** 把歌曲加入播放队列（不播放） */
  addToQueue: (name: string, artist: string, path?: string) => void
  /** 收藏 / 取消收藏指定歌曲（key 唯一标识，搜索结果行用） */
  toggleLikeSong: (name: string, artist: string, path?: string, key?: string) => void
  /** 为指定歌曲设置歌词文本（联网云歌词用） */
  setLyrics: (name: string, text: string) => void
  /** 把下载的云歌加入本地音乐列表（按路径去重） */
  addLocalSong: (name: string, path: string, artist?: string, album?: string) => void
  themeDark: boolean
  toggleTheme: () => void
  toast: (message: string) => void
  /** 本地音乐默认下载位置 */
  defaultMusicPath: string
  /** 已导入的本地歌曲（持久化） */
  localSongs: LocalSong[]
  /** 播放队列：播放过的歌曲（最新在前，去重） */
  playQueue: QueueItem[]
  /** 手动导入本地音乐文件（主进程弹出多文件选择） */
  importLocalFiles: () => Promise<void>
  /** 播放状态 */
  isPlaying: boolean
  currentTime: number
  duration: number
  togglePlay: () => void
  /** 跳转到指定时间（秒） */
  seek: (t: number) => void
  currentTimeLabel: string
  durationLabel: string
  /** 音量 0–1 */
  volume: number
  setVolume: (v: number) => void
  /** 歌词库：按歌曲名存储（持久化） */
  lyricsBySong: Record<string, string>
  /** 实时频谱：本地歌曲播放时 AnalyserNode 输出的 0–1 波形高度（48 点低频映射） */
  spectrumRef: React.MutableRefObject<Float32Array>
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
  const [currentAlbum, setCurrentAlbum] = useState('')
  const [themeDark, setThemeDark] = useState(false)
  const [defaultMusicPath, setDefaultMusicPath] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volumeState, setVolumeState] = useState(0.7)
  // 播放队列：播放过的歌曲（最新在前）
  const [playQueue, setPlayQueue] = useState<QueueItem[]>([])

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

  // 收藏的歌曲：从 localStorage 恢复
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>(() => {
    try {
      const raw = localStorage.getItem(LS_LIKED)
      return raw ? (JSON.parse(raw) as LikedSong[]) : []
    } catch {
      return []
    }
  })

  // 全局唯一的音频播放器实例
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (!audioRef.current) {
    audioRef.current = new Audio()
    audioRef.current.volume = volumeState
  }
  const toastTimer = useRef<number | undefined>(undefined)

  // 实时频谱：懒创建（首次播放时在用户手势内初始化，幂等，避免 StrictMode 双执行与 AudioContext 泄漏）
  const spectrumRef = useRef<Float32Array>(new Float32Array(48))
  const ensureSpectrum = useCallback((a: HTMLAudioElement): AudioContext | undefined => {
    const tagged = a as unknown as { __lwaveSpectrum?: { actx: AudioContext; analyser: AnalyserNode } }
    if (tagged.__lwaveSpectrum) return tagged.__lwaveSpectrum.actx
    try {
      const actx = new AudioContext()
      const src = actx.createMediaElementSource(a)
      const analyser = actx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.78
      src.connect(analyser)
      analyser.connect(actx.destination)
      tagged.__lwaveSpectrum = { actx, analyser }
      const N = spectrumRef.current.length
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        requestAnimationFrame(tick)
        analyser.getByteFrequencyData(buf)
        // 宽频段映射：各波形点覆盖不同频率（0–0.6 频段），能量差异大，保持各点独立不规则
        const half = analyser.frequencyBinCount
        const arr = spectrumRef.current
        for (let i = 0; i < N; i++) {
          const bin = Math.floor((i / N) * half * 0.6)
          arr[i] = Math.max(0, Math.min(1, buf[bin] / 255))
        }
      }
      tick()
      return actx
    } catch {
      return undefined
    }
  }, [spectrumRef])

  // 持久化本地歌曲库 / 歌词库 / 收藏
  useEffect(() => {
    try {
      localStorage.setItem(LS_LOCAL_SONGS, JSON.stringify(localSongs))
      localStorage.setItem(LS_LYRICS, JSON.stringify(lyricsBySong))
      localStorage.setItem(LS_LIKED, JSON.stringify(likedSongs))
    } catch {
      /* 忽略写入失败 */
    }
  }, [localSongs, lyricsBySong, likedSongs])

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

  const navigate = useCallback((r: Route, q?: string) => {
    setRoute(r)
    // 只有显式传入关键词才更新，切走页面不清空上次搜索词（返回搜索页保持结果）
    if (q !== undefined && q !== '') setSearchQuery(q)
  }, [])

  const play = useCallback((title: string, path?: string, artist?: string, album?: string) => {
    setCurrentSong(title)
    setCurrentPath(path)
    setCurrentArtist(artist || '未知歌手')
    setCurrentAlbum(album || '')
    // 播放过的歌曲加入播放队列（最新在前，去重）
    setPlayQueue((prev) => [{ name: title, artist: artist || '未知歌手', path }, ...prev.filter((q) => q.name !== title)])
    const a = audioRef.current
    if (!a) return
    if (path) {
      // 本地歌曲：真实播放（首次播放时初始化实时频谱，用户手势内 AudioContext 可直接启动）
      const actx = ensureSpectrum(a)
      if (actx && actx.state === 'suspended') actx.resume().catch(() => {})
      a.src = /^https?:/.test(path) ? path : window.api.music.toFileUrl(path)
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    } else {
      // 内置曲目：无本地文件，仅切换标题并停止当前音频
      a.pause()
      a.removeAttribute('src')
      setIsPlaying(false)
    }
  }, [ensureSpectrum])

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

  // 跳转到指定时间
  const seek = useCallback((t: number) => {
    const a = audioRef.current
    if (!a) return
    const max = a.duration || 0
    a.currentTime = Math.max(0, Math.min(t, max))
    setCurrentTime(a.currentTime)
  }, [])

  const setVolume = useCallback((v: number) => {
    const vol = Math.max(0, Math.min(1, v))
    setVolumeState(vol)
    const a = audioRef.current
    if (a) a.volume = vol
  }, [])

  // 收藏 / 取消收藏当前播放歌曲
  const toggleLike = useCallback(() => {
    setLikedSongs((prev) => {
      if (prev.some((l) => l.name === currentSong)) return prev.filter((l) => l.name !== currentSong)
      return [...prev, { name: currentSong, artist: currentArtist, path: currentPath }]
    })
  }, [currentSong, currentArtist, currentPath])

  // 从收藏中移除指定歌曲
  const removeLiked = useCallback((name: string) => {
    setLikedSongs((prev) => prev.filter((l) => l.name !== name))
  }, [])

  // 把指定歌曲加入播放队列（不播放，最新在前去重）
  const addToQueue = useCallback((name: string, artist: string, path?: string) => {
    setPlayQueue((prev) => [{ name, artist, path }, ...prev.filter((q) => q.name !== name)])
  }, [])

  // 收藏 / 取消收藏指定歌曲（key 唯一标识，避免同名歌曲联动）
  const toggleLikeSong = useCallback((name: string, artist: string, path?: string, key?: string) => {
    setLikedSongs((prev) => {
      const exists = prev.some((l) => (key ? l.key === key : l.name === name))
      if (exists) return prev.filter((l) => (key ? l.key !== key : l.name !== name))
      return [...prev, { name, artist, path, key }]
    })
  }, [])

  // 为指定歌曲设置歌词文本（联网云歌词用）
  const setLyrics = useCallback((name: string, text: string) => {
    if (text.trim()) setLyricsBySong((prev) => ({ ...prev, [name]: text }))
  }, [])

  // 把下载的云歌加入本地音乐列表（按路径去重）
  const addLocalSong = useCallback((name: string, path: string, artist?: string, album?: string) => {
    setLocalSongs((prev) => (prev.some((s) => s.path === path) ? prev : [...prev, { name, path, artist, album }]))
  }, [])

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
            if (!merged.some((m) => m.path === s.path)) merged.push({ name: s.name, path: s.path, artist: s.artist, album: s.album, year: s.year })
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
      currentAlbum,
      currentPath,
      play,
      removeLocalSong,
      likedSongs,
      toggleLike,
      removeLiked,
      addToQueue,
      toggleLikeSong,
      setLyrics,
      addLocalSong,
      themeDark,
      toggleTheme,
      toast,
      defaultMusicPath,
      localSongs,
      playQueue,
      importLocalFiles,
      spectrumRef,
      isPlaying,
      currentTime,
      duration,
      togglePlay,
      seek,
      currentTimeLabel: fmt(currentTime),
      durationLabel: fmt(duration),
      volume: volumeState,
      setVolume,
      lyricsBySong,
      attachLyrics
    }),
    [route, searchQuery, navigate, currentSong, currentArtist, currentAlbum, currentPath, play, removeLocalSong, likedSongs, toggleLike, removeLiked, addToQueue, toggleLikeSong, setLyrics, addLocalSong, themeDark, toggleTheme, toast, defaultMusicPath, localSongs, playQueue, importLocalFiles, isPlaying, currentTime, duration, togglePlay, seek, volumeState, setVolume, lyricsBySong, attachLyrics]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
