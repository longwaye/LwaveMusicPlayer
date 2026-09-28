import { useMemo, useRef, useEffect, useCallback, useState } from 'react'
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

/** 稳定的基础波形（按歌曲名生成，绘制进度条 SVG 波形折线） */
function pseudoPeaks(key: string, n = 120): number[] {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619) }
  const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 }
  const out: number[] = []
  let v = 0
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * 0.5
    v *= 0.92
    out.push(Math.max(0.3, Math.min(1, 0.6 + v)))
  }
  return out
}

export function HomePage(): JSX.Element {
  const { toast, likedSongs, toggleLike, currentSong, currentArtist, currentPath, isPlaying, togglePlay, seek, currentTimeLabel, durationLabel, currentTime, duration, volume, setVolume, lyricsBySong, attachLyrics, localSongs, playQueue, spectrumRef } = useApp()
  // 当前歌曲是否已收藏
  const isFav = likedSongs.some((l) => l.name === currentSong)
  // 当前歌曲的封面与年份（内置曲目跟随歌曲数据；本地歌曲读取文件元数据与内嵌封面）
  const song = songs.find((s) => s.name === currentSong)
  const local = currentPath ? localSongs.find((s) => s.path === currentPath) : undefined
  const [localCover, setLocalCover] = useState('')
  useEffect(() => {
    if (!currentPath) { setLocalCover(''); return }
    setLocalCover('')
    let alive = true
    window.api.music
      .getCover(currentPath)
      .then((r) => { if (alive && r.cover) setLocalCover(r.cover) })
      .catch(() => {})
    return () => { alive = false }
  }, [currentPath])
  const cover = currentPath ? (localCover || IMG.hero) : (song?.img ?? IMG.hero)
  const metaLabel = currentPath
    ? [local?.album, local?.year].filter(Boolean).join(' · ') || '本地音乐'
    : (song ? [song.album, song.year].filter(Boolean).join(' · ') : '')
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
  const manualScrollRef = useRef(0)
  const lastAutoScrollRef = useRef(0)
  // 用元素相对滚动容器的实际位置计算，保证高亮行精确居中
  const centerActive = useCallback(() => {
    const el = activeLineRef.current
    const box = lyricsListRef.current
    if (!el || !box) return
    const boxTop = box.getBoundingClientRect().top
    const elTop = el.getBoundingClientRect().top
    const target = box.scrollTop + (elTop - boxTop) - box.clientHeight / 2 + el.clientHeight / 2
    box.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [])
  useEffect(() => {
    if (timed && activeIdx >= 0) centerActive()
  }, [activeIdx, timed, centerActive])

  // 手动滚动或窗口缩放后，约 3 秒无操作则自动回到高亮行居中
  useEffect(() => {
    if (!timed || activeIdx < 0) return
    const center = () => {
      const now = Date.now()
      if (now - manualScrollRef.current > 3000 && now - lastAutoScrollRef.current > 2500) {
        lastAutoScrollRef.current = now
        centerActive()
      }
    }
    const t = window.setInterval(center, 1200)
    window.addEventListener('resize', center)
    return () => {
      window.clearInterval(t)
      window.removeEventListener('resize', center)
    }
  }, [activeIdx, timed, centerActive])

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

  // 基础波形：切歌时重新生成（稳定的伪波形）
  const [basePeaks, setBasePeaks] = useState<number[]>(() => pseudoPeaks(currentSong))
  useEffect(() => { setBasePeaks(pseudoPeaks(currentSong)) }, [currentSong])
  // 波形 SVG 折线路径（viewBox 0 0 1000 100）
  const wavePath = useMemo(() => {
    let d = 'M0 50'
    basePeaks.forEach((p, i) => {
      const x = (i / (basePeaks.length - 1)) * 1000
      const y = 50 - (p - 0.5) * 34
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`
    })
    d += ' L1000 50'
    return d
  }, [basePeaks])

  // 实时频谱驱动波形：本地歌曲真实播放时每帧更新 SVG path（否则保持伪波形）
  const waveLineRef = useRef<SVGPathElement>(null)
  const waveGlowRef = useRef<SVGPathElement>(null)
  useEffect(() => {
    const line = waveLineRef.current
    const glow = waveGlowRef.current
    if (!line || !glow) return
    if (!isPlaying || !currentPath) {
      line.setAttribute('d', wavePath)
      glow.setAttribute('d', wavePath)
      return
    }
    let raf = 0
    const sp = spectrumRef.current
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // 去均值：波形形态固定为不规则折线(basePeaks)，各点只做独立轻微震动，避免整条规律升降
      let sum = 0
      for (let i = 0; i < sp.length; i++) sum += sp[i]
      const spAvg = sum / sp.length
      let d = 'M0 50'
      for (let i = 0; i < sp.length; i++) {
        const x = (i / (sp.length - 1)) * 1000
        const base = basePeaks[i] // 不规则基础形态
        const y = Math.max(6, Math.min(94, 50 - (base - 0.5) * 30 - (sp[i] - spAvg) * 12))
        d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1)
      }
      d += ' L1000 50'
      line.setAttribute('d', d)
      glow.setAttribute('d', d)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, currentPath, wavePath, spectrumRef, basePeaks])

  // 进度条：ember-progress 结构，点击 / 按住拖动跳转播放进度
  const progressRef = useRef<HTMLDivElement>(null)
  const progressDragRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const seekRatio = (clientX: number) => {
    const box = progressRef.current
    if (!box || duration <= 0) return
    const r = box.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    seek(ratio * duration)
  }
  const onProgressDown = (e: React.PointerEvent<HTMLDivElement>) => {
    progressDragRef.current = true
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    seekRatio(e.clientX)
  }
  const onProgressMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (progressDragRef.current) seekRatio(e.clientX)
  }
  const onProgressUp = (e: React.PointerEvent<HTMLDivElement>) => {
    progressDragRef.current = false
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  // 音量条：点击 / 按住拖动设置音量
  const volumeTrackRef = useRef<HTMLDivElement>(null)
  const volDragRef = useRef(false)
  const setVolByX = (clientX: number) => {
    const box = volumeTrackRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    const v = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    setVolume(v)
  }
  const onVolDown = (e: React.PointerEvent<HTMLDivElement>) => {
    volDragRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setVolByX(e.clientX)
  }
  const onVolMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (volDragRef.current) setVolByX(e.clientX)
  }
  const onVolUp = (e: React.PointerEvent<HTMLDivElement>) => {
    volDragRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

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
                  className={`circle-btn accent js-like${isFav ? ' liked' : ''}`}
                  onClick={() => { toggleLike(); toast(isFav ? '已取消收藏' : '已收藏') }}
                >
                  {isFav ? '♥' : '♡'}
                </button>
              </div>
              <div className="progress-area">
                <div
                  className={`ember-progress${dragging ? ' is-dragging' : ''}`}
                  ref={progressRef}
                  role="slider"
                  tabIndex={0}
                  aria-label="播放进度"
                  style={{ '--progress': `${pct}%` } as React.CSSProperties}
                  onPointerDown={onProgressDown}
                  onPointerMove={onProgressMove}
                  onPointerUp={onProgressUp}
                >
                  <div className="ember-progress__ambient" />
                  <div className="ember-progress__track" />
                  <div className="ember-progress__remaining" />
                  <svg className="ember-progress__wave" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
                    <path ref={waveGlowRef} className="ember-progress__wave-glow" d={wavePath} />
                    <path ref={waveLineRef} className="ember-progress__wave-line" d={wavePath} />
                  </svg>
                  <div className="ember-progress__played" />
                  <button className="ember-progress__thumb" aria-label="拖动播放位置" />
                </div>
                <div className="time-row"><span>{currentTimeLabel}</span><span>{durationLabel}</span></div>
              </div>
              <div className="play-controls">
                <button>◀◀</button>
                <button className="play-main" onClick={togglePlay}>{isPlaying ? 'Ⅱ' : '▶'}</button>
                <button>▶▶</button>
                <div className="volume-control">
                  <svg className="volume-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
                    {volume > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7M17.8 6.2a8 8 0 0 1 0 11.6" />}
                  </svg>
                  <div className="volume-track" ref={volumeTrackRef} onPointerDown={onVolDown} onPointerMove={onVolMove} onPointerUp={onVolUp}>
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
