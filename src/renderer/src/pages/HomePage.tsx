import { useMemo, useRef, useEffect } from 'react'
import { useApp } from '@renderer/context/AppContext'
import { HeroSearchBox } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG, songs } from '@renderer/data/ember'
/** 解析 LRC 歌词为带时间戳的行（无时间戳则 time = -1） */
function parseLrc(content: string): { time: number; text: string }[] {
  const out: { time: number; text: string }[] = []
  for (const line of content.split('\n')) {
    const times = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)]
    const text = line.replace(/\[[^\]]*\]/g, '').trim()
    if (!text) continue
    if (times.length) {
      for (const m of times) {
        out.push({ time: +m[1] * 60 + +m[2] + (+m[3] || 0) / 100, text })
      }
    } else {
      out.push({ time: -1, text })
    }
  }
  out.sort((a, b) => a.time - b.time)
  return out
}

export function HomePage(): JSX.Element {
  const { toast, liked, toggleLike, currentSong, currentArtist, currentPath, isPlaying, togglePlay, currentTimeLabel, durationLabel, currentTime, duration, volume, setVolume, lyricsBySong, attachLyrics, localSongs, playQueue } = useApp()
  // 当前歌曲的封面与年份（内置曲目跟随歌曲数据；本地歌曲读取文件元数据）
  const song = songs.find((s) => s.name === currentSong)
  const local = currentPath ? localSongs.find((s) => s.path === currentPath) : undefined
  const cover = currentPath ? IMG.hero : (song?.img ?? IMG.hero)
  const metaLabel = currentPath ? (local?.year ?? '本地音乐') : (song?.year ?? '')
  // 歌词：解析为带时间戳的行，按播放进度高亮当前行并滚动居中
  const rawLyrics = lyricsBySong[currentSong] || ''
  const lrcLines = useMemo(() => parseLrc(rawLyrics), [rawLyrics])
  const timed = lrcLines.some((l) => l.time >= 0)
  let activeIdx = -1
  if (timed) {
    for (let i = 0; i < lrcLines.length; i++) {
      if (lrcLines[i].time >= 0 && lrcLines[i].time <= currentTime) activeIdx = i
    }
  }
  const lyricsListRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (timed && activeIdx >= 0 && activeLineRef.current && lyricsListRef.current) {
      const el = activeLineRef.current
      const box = lyricsListRef.current
      box.scrollTo({ top: Math.max(0, el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2), behavior: 'smooth' })
    }
  }, [activeIdx, timed])

  // 手动滚动或窗口缩放后，约 3 秒无操作则自动回到高亮行居中
  const manualScrollRef = useRef(0)
  const lastAutoScrollRef = useRef(0)
  useEffect(() => {
    if (!timed || activeIdx < 0) return
    const center = () => {
      const now = Date.now()
      if (now - manualScrollRef.current > 3000 && now - lastAutoScrollRef.current > 2500) {
        lastAutoScrollRef.current = now
        const el = activeLineRef.current
        const box = lyricsListRef.current
        if (el && box) box.scrollTo({ top: Math.max(0, el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2), behavior: 'smooth' })
      }
    }
    const t = window.setInterval(center, 1200)
    window.addEventListener('resize', center)
    return () => {
      window.clearInterval(t)
      window.removeEventListener('resize', center)
    }
  }, [activeIdx, timed])

  // 播放队列：最近播放过歌曲（最新在前）
  const queueItems = playQueue.map((item, i) => {
    const s = songs.find((x) => x.name === item.name)
    const local = item.path ? localSongs.find((x) => x.path === item.path) : undefined
    return {
      num: String(i + 1).padStart(2, '0'),
      name: item.name,
      artist: item.artist || s?.artist || local?.artist || '',
      img: s?.img,
      time: s?.time || (local?.year ? local.year + ' ·' : '')
    }
  })
  // 音量条点击设置音量
  const onVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const v = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    setVolume(v)
  }
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  return (
    <main className="main home-main">
      {/* HERO / NOW PLAYING */}
      <section className="hero">
        <Placeholder ph="hero" img={cover} className="hero-image" />
        <div className="hero-content">
          <HeroSearchBox />
          <div className="hero-main">
            <div className="hero-head">
              <div className="hero-kicker">NOW PLAYING</div>
              <h1 className="hero-title">{currentSong}</h1>
              <div className="hero-artist">{currentArtist}</div>
              <div className="hero-meta">
                <span className="hero-rule" />
                <span>{metaLabel}</span>
              </div>
            </div>
            {/* 歌词展示区：有歌词则逐行显示并按进度高亮，无则提供本地上传 */}
            <div className="lyrics-area" ref={lyricsListRef} onWheel={() => { manualScrollRef.current = Date.now() }}>
              {lrcLines.length ? (
                <div className="lyrics-text">
                  {lrcLines.map((l, i) => (
                    <p key={i} className={'lyric-line' + (timed && i === activeIdx ? ' active' : '')} ref={i === activeIdx ? activeLineRef : undefined}>{l.text}</p>
                  ))}
                </div>
              ) : (
                <div className="lyrics-placeholder">
                  <span>暂无歌词</span>
                  <button className="lyrics-upload" onClick={() => attachLyrics()}>上传歌词</button>
                </div>
              )}
            </div>
            <div className="hero-foot">
              <div className="hero-buttons">
                <button
                  className={`circle-btn accent js-like${liked ? ' liked' : ''}`}
                  onClick={() => { toggleLike(); toast(liked ? '已取消收藏' : '已收藏') }}
                >
                  ♥
                </button>
                <button className="circle-btn" onClick={() => toast('已加入播放列表')}>＋</button>
                <button className="circle-btn" onClick={() => toast('更多操作')}>···</button>
              </div>
              <div className="progress-area">
                <div className="progress-line">
                  <i className="progress-fill" style={{ width: `${pct}%` }} />
                  <i className="progress-dot" style={{ left: `${pct}%` }} />
                </div>
                <div className="time-row"><span>{currentTimeLabel}</span><span>{durationLabel}</span></div>
              </div>
              <div className="play-controls">
                <button>⌁</button>
                <button>◀</button>
                <button className="play-main" onClick={togglePlay}>{isPlaying ? 'Ⅱ' : '▶'}</button>
                <button>▶</button>
                <button>↻</button>
                <div className="volume-control">
                  <svg className="volume-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
                    {volume > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7M17.8 6.2a8 8 0 0 1 0 11.6" />}
                  </svg>
                  <div className="volume-track" onClick={onVolumeClick}>
                    <i className="volume-fill" style={{ width: `${volume * 100}%` }} />
                    <i className="volume-dot" style={{ left: `${volume * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 播放队列：播放过的歌曲 */}
        <aside className="queue">
          <h2 className="queue-title">Ⅰ　播放队列</h2>
          {queueItems.map((t) => (
            <div className="queue-row" key={t.num + t.name}>
              <span>{t.num}</span>
              <Placeholder img={t.img} />
              <div>
                <b>{t.name}</b>
                <small>{t.artist}</small>
              </div>
              <time>{t.time}</time>
            </div>
          ))}
          {queueItems.length === 0 && <p className="queue-empty">播放过的歌曲会出现在这里。</p>}
        </aside>
      </section>
    </main>
  )
}
export default HomePage
