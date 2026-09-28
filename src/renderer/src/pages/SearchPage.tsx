import { useEffect, useRef, useState } from 'react'
import { useApp } from '@renderer/context/AppContext'
import { HeroSearchBox, SectionHead } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG } from '@renderer/data/ember'

interface CloudSong {
  id: number
  name: string
  artist: string
  album: string
  pic?: string
  duration: number
}

interface MenuState {
  x: number
  y: number
  song: CloudSong
}

/** 每页条数：避免结果撑大窗口，采用分页 */
const PAGE_SIZE = 10

/** 模块级搜索结果缓存：切页再返回时保持上次结果，不重新请求 */
const searchCache: Record<string, { songs: CloudSong[]; total: number }> = {}

/** 毫秒时长 -> m:ss */
const fmtDuration = (ms: number): string => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** cloudsearch 返回的歌曲映射为标准行（真实字段为 ar/al/dt，picUrl 转 https + 小图参数） */
function mapSong(it: any): CloudSong {
  const pic = it.al?.picUrl ? it.al.picUrl.replace(/^http:\/\//, 'https://') + '?param=100y100' : undefined
  return {
    id: it.id,
    name: it.name,
    artist: (it.ar ?? []).map((a: any) => a.name).join(' / ') || '未知歌手',
    album: it.al?.name ?? '',
    pic,
    duration: it.dt ?? 0
  }
}

export function SearchPage(): JSX.Element {
  const { searchQuery, navigate, play, toast, addToQueue, toggleLikeSong, setLyrics, addLocalSong, likedSongs } = useApp()
  const [hotWords, setHotWords] = useState<string[]>([])
  const [cloudSongs, setCloudSongs] = useState<CloudSong[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [searching, setSearching] = useState(false)
  const [activeId, setActiveId] = useState(0)
  const [menu, setMenu] = useState<MenuState | null>(null)
  const rowTimer = useRef<number>(0)

  // 热门搜索：真实热搜榜（进入页面加载一次）
  useEffect(() => {
    window.api.netease
      .searchHot()
      .then((res) => {
        const arr = (res as { data?: { searchWord?: string }[] }).data ?? []
        setHotWords(arr.slice(0, 8).map((h) => h.searchWord ?? '').filter(Boolean))
      })
      .catch(() => {})
  }, [])

  // 云搜索（分页）；命中模块级缓存则直接复用，返回页面不重新请求
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setCloudSongs([])
      setTotal(0)
      setPage(0)
      return
    }
    const key = `${q}|${page}`
    const cached = searchCache[key]
    if (cached) {
      setCloudSongs(cached.songs)
      setTotal(cached.total)
      setSearching(false)
      return
    }
    let cancel = false
    setSearching(true)
    window.api.netease
      .search(q, 1, PAGE_SIZE, page * PAGE_SIZE)
      .then((res) => {
        if (cancel) return
        const r = res as { result?: { songs?: unknown[]; songCount?: number } }
        const songs = (r.result?.songs ?? []).map(mapSong)
        const totalCount = r.result?.songCount ?? 0
        searchCache[key] = { songs, total: totalCount }
        setCloudSongs(songs)
        setTotal(totalCount)
        setSearching(false)
      })
      .catch(() => {
        if (!cancel) {
          setSearching(false)
          toast('云搜索失败，请确认网易云 API 服务已启动')
        }
      })
    return () => {
      cancel = true
    }
  }, [searchQuery, page, toast])

  // 点击菜单外任意处关闭右键菜单
  useEffect(() => {
    const close = () => setMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  // 播放云歌（取播放链接）
  const handlePlay = async (s: CloudSong) => {
    try {
      setActiveId(s.id)
      const res = (await window.api.netease.songUrl(s.id)) as { data?: { url?: string }[] }
      const url = res?.data?.[0]?.url
      if (!url) {
        setActiveId(0)
        toast('未获取到播放链接（可能需登录 VIP）')
        return
      }
      play(s.name, url, s.artist)
      // 播放云歌时联网取歌词，供首页歌词区展示
      window.api.netease
        .lyric(s.id)
        .then((lr) => {
          const text = (lr as { lrc?: { lyric?: string } }).lrc?.lyric
          if (text) setLyrics(s.name, text)
        })
        .catch(() => {})
    } catch {
      setActiveId(0)
      toast('播放失败')
    }
  }

  // 单击延时播放、双击立即播放（避免双击触发两次）
  const onRowClick = (s: CloudSong) => {
    window.clearTimeout(rowTimer.current)
    rowTimer.current = window.setTimeout(() => handlePlay(s), 240)
  }
  const onRowDouble = (s: CloudSong) => {
    window.clearTimeout(rowTimer.current)
    handlePlay(s)
  }

  const onRowContext = (e: React.MouseEvent, s: CloudSong) => {
    e.preventDefault()
    const w = 240
    const h = 240
    setMenu({ x: Math.min(e.clientX, window.innerWidth - w - 8), y: Math.min(e.clientY, window.innerHeight - h - 8), song: s })
  }

  const handleHot = (word: string) => {
    setPage(0)
    navigate('search', word)
  }

  const isLiked = (s: CloudSong) => likedSongs.some((l) => l.key === 'n' + s.id)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const menuLike = (s: CloudSong) => {
    toggleLikeSong(s.name, s.artist, undefined, 'n' + s.id)
    toast(isLiked(s) ? '已取消收藏' : '已收藏')
    setMenu(null)
  }
  const menuDownloadSong = async (s: CloudSong) => {
    setMenu(null)
    toast('开始下载歌曲…')
    const res = (await window.api.netease.downloadSong(s.id, s.name)) as { ok?: boolean; path?: string }
    if (res?.ok) {
      if (res.path) addLocalSong(s.name, res.path, s.artist, s.album)
      toast(`已下载并加入本地音乐：${s.name}`)
    }
    else toast('下载失败（可能需登录 VIP）')
  }
  const menuDownloadLyric = async (s: CloudSong) => {
    setMenu(null)
    const res = (await window.api.netease.downloadLyric(s.id, s.name)) as { ok?: boolean }
    if (res?.ok) toast('歌词已下载')
    else toast('未找到歌词可下载')
  }

  return (
    <main className="main">
      <div className="search-hero" style={{ minHeight: 330, position: 'relative', overflow: 'hidden' }}>
        <Placeholder ph="hero" img={IMG.hero} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(30,30,27,.18),transparent 65%)' }} />
        <div className="hero-content" style={{ paddingTop: 31 }}>
          <HeroSearchBox defaultValue={searchQuery} />
          <div className="hero-main" style={{ marginTop: 'auto', paddingBottom: 5 }}>
            <div className="hero-kicker">SEARCH</div>
            <h1 className="hero-title" style={{ fontSize: 64 }}>Search</h1>
            <div className="hero-artist" style={{ fontSize: 17 }}>在声音中，找到你想要的风景。</div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="section" style={{ paddingTop: 25 }}>
          <SectionHead title="热门搜索" />
          <div className="hot-tags">
            {hotWords.map((w, i) => (
              <button key={w} className="hot-tag" onClick={() => handleHot(w)}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <span>{w}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="section">
          <SectionHead title={searchQuery.trim() ? `搜索结果 · ${searchQuery}` : '搜索结果'} />
          {searching ? (
            <div className="result-empty">正在搜索…</div>
          ) : cloudSongs.length === 0 ? (
            <div className="result-empty">
              {searchQuery.trim() ? '没有找到相关歌曲' : '输入关键词，搜索网易云曲库'}
            </div>
          ) : (
            <>
              <div className="search-results">
                {cloudSongs.map((s, idx) => (
                  <div
                    className="result-row"
                    key={s.id}
                    onClick={() => onRowClick(s)}
                    onDoubleClick={() => onRowDouble(s)}
                    onContextMenu={(e) => onRowContext(e, s)}
                  >
                    <span className="result-idx">{String(page * PAGE_SIZE + idx + 1).padStart(2, '0')}</span>
                    <div className="result-title">
                      {s.pic ? <img className="result-cover" src={s.pic} alt={s.name} loading="lazy" /> : <span className="result-cover result-cover--ph" />}
                      <b>{s.name}</b>
                    </div>
                    <span className="result-artist">{s.artist}</span>
                    <span className="result-album">{s.album}</span>
                    <time className="result-time">{fmtDuration(s.duration)}</time>
                    <span className="result-actions">
                      <button className={`result-act ${activeId === s.id ? 'on' : ''}`} title="播放" onClick={(e) => { e.stopPropagation(); onRowDouble(s) }}>▶</button>
                      <button className="result-act" title="加入播放列表" onClick={(e) => { e.stopPropagation(); addToQueue(s.name, s.artist); toast('已加入播放列表') }}>＋</button>
                      <button className={`result-act like ${isLiked(s) ? 'on' : ''}`} title="喜欢" onClick={(e) => { e.stopPropagation(); menuLike(s) }}>♥</button>
                    </span>
                  </div>
                ))}
              </div>
              <div className="pagination">
                <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>‹ 上一页</button>
                <span>{page + 1} / {totalPages}</span>
                <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页 ›</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 歌曲右键菜单 */}
      {menu && (
        <div className="song-menu" style={{ left: menu.x, top: menu.y }} onClick={(e) => e.stopPropagation()}>
          <div className="song-menu__head">
            {menu.song.pic ? <img className="song-menu__cover" src={menu.song.pic} alt="" /> : <span className="song-menu__cover song-menu__cover--ph" />}
            <div className="song-menu__meta">
              <b>{menu.song.name}</b>
              <span>{menu.song.artist}</span>
              <span>{menu.song.album}</span>
              <span>{fmtDuration(menu.song.duration)}</span>
            </div>
          </div>
          <div className="song-menu__sep" />
          <button className="song-menu__item" onClick={() => { setMenu(null); onRowDouble(menu.song) }}>▶ 播放</button>
          <button className="song-menu__item" onClick={() => menuLike(menu.song)}>
            {isLiked(menu.song) ? '♥ 取消喜欢' : '♥ 喜欢'}
          </button>
          <button className="song-menu__item" onClick={() => menuDownloadSong(menu.song)}>⤓ 下载歌曲</button>
          <button className="song-menu__item" onClick={() => menuDownloadLyric(menu.song)}>⤓ 下载歌词</button>
        </div>
      )}
    </main>
  )
}
export default SearchPage
