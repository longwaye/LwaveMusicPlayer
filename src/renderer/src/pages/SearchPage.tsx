import { useEffect, useState } from 'react'
import { useApp } from '@renderer/context/AppContext'
import { AlbumCard, HeroSearchBox, SectionHead } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG } from '@renderer/data/ember'

const hotSearches = [
  { title: 'The Big Ship', meta: 'Brian Eno', img: IMG.playlist(1) },
  { title: 'Ambient', meta: '氛围音乐', img: IMG.playlist(2) },
  { title: 'Lost in Winter', meta: '冬日氛围', img: IMG.playlist(3) },
  { title: 'Nature Sounds', meta: '自然之声', img: IMG.playlist(4) }
]

interface CloudSong {
  id: number
  name: string
  artist: string
  album: string
  pic?: string
  duration: number
}

/** 毫秒时长 -> m:ss */
const fmtDuration = (ms: number): string => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function SearchPage(): JSX.Element {
  const { searchQuery, navigate, play, toast } = useApp()
  const [cloudSongs, setCloudSongs] = useState<CloudSong[]>([])
  const [searching, setSearching] = useState(false)
  const [activeId, setActiveId] = useState<number>(0)

  // 关键词变化 -> 搜云歌（网易云曲库）
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setCloudSongs([])
      return
    }
    let cancel = false
    setSearching(true)
    window.api.netease
      .search(q, 1, 30, 0)
      .then((res) => {
        if (cancel) return
        const raw = (res as { result?: { songs?: unknown[] } }).result?.songs ?? []
        const songs = raw.map((s) => {
          const it = s as {
            id: number
            name: string
            artists?: { name: string }[]
            album?: { name: string; picUrl?: string }
            duration?: number
          }
          return {
            id: it.id,
            name: it.name,
            artist: (it.artists ?? []).map((a) => a.name).join(' / ') || '未知歌手',
            album: it.album?.name ?? '',
            pic: it.album?.picUrl,
            duration: it.duration ?? 0
          }
        })
        setCloudSongs(songs)
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
  }, [searchQuery, toast])

  // 点击云歌 -> 取播放链接并播放
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
    } catch {
      setActiveId(0)
      toast('播放失败')
    }
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
          <SectionHead title="热门搜索" linkLabel="查看更多 →" />
          <div className="grid-4">
            {hotSearches.map((h) => (
              <AlbumCard key={h.title} img={h.img} title={h.title} meta={h.meta} phStyle={{ height: 130 }} onClick={() => navigate('album')} />
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
            <div className="search-results">
              {cloudSongs.map((s, i) => (
                <button
                  className={`result-row ${activeId === s.id ? 'result-active' : ''}`}
                  key={s.id}
                  onClick={() => handlePlay(s)}
                >
                  <span>{i + 1}</span>
                  <div className="result-title">
                    {s.pic ? (
                      <img className="result-cover" src={s.pic} alt={s.name} loading="lazy" />
                    ) : (
                      <Placeholder img={IMG.playlist(1)} />
                    )}
                    <b>{s.name}</b>
                  </div>
                  <span>{s.artist}</span>
                  <time>{fmtDuration(s.duration)}</time>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
export default SearchPage
