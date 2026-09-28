/**
 * 全局底部播放条：非首页时固定在窗口底部，功能与首页播放区一致
 * （歌曲信息 / 可拖动进度条 / 播放暂停 / 上一首下一首 / 收藏 / 音量）
 */
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@renderer/context/AppContext'

export function BottomPlayer(): JSX.Element {
  const {
    currentSong,
    currentArtist,
    currentAlbum,
    currentPath,
    isPlaying,
    togglePlay,
    play,
    currentTime,
    duration,
    seek,
    currentTimeLabel,
    durationLabel,
    volume,
    setVolume,
    likedSongs,
    toggleLike,
    toast,
    playQueue
  } = useApp()

  const isFav = likedSongs.some((l) => l.name === currentSong)

  // 专辑封面：本地歌曲从文件读取封面，云歌/无封面时用渐变占位
  const [cover, setCover] = useState('')
  useEffect(() => {
    let alive = true
    if (currentPath && !/^https?:/.test(currentPath)) {
      window.api.music
        .getCover(currentPath)
        .then((r) => { if (alive && r.cover) setCover(r.cover) })
        .catch(() => {})
    } else {
      setCover('')
    }
    return () => { alive = false }
  }, [currentPath])

  // 进度条：点击 / 按住拖动跳转
  const progressRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const setProgressByX = (clientX: number) => {
    const box = progressRef.current
    if (!box || !duration) return
    const r = box.getBoundingClientRect()
    seek(((clientX - r.left) / r.width) * duration)
  }
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setProgressByX(e.clientX)
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) setProgressByX(e.clientX)
  }
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  // 音量条：点击 / 按住拖动
  const volRef = useRef<HTMLDivElement>(null)
  const volDrag = useRef(false)
  const setVolByX = (clientX: number) => {
    const box = volRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    setVolume(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }
  const onVolDown = (e: React.PointerEvent<HTMLDivElement>) => {
    volDrag.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setVolByX(e.clientX)
  }
  const onVolMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (volDrag.current) setVolByX(e.clientX)
  }
  const onVolUp = (e: React.PointerEvent<HTMLDivElement>) => {
    volDrag.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  // 上一首 / 下一首：基于播放队列（最新在前）
  const qi = playQueue.findIndex((q) => q.name === currentSong)
  const prevSong = qi >= 0 ? playQueue[qi + 1] : undefined
  const nextSong = qi > 0 ? playQueue[qi - 1] : undefined
  const prev = () => {
    if (prevSong) play(prevSong.name, prevSong.path, prevSong.artist)
    else toast('没有更早的播放记录')
  }
  const next = () => {
    if (nextSong) play(nextSong.name, nextSong.path, nextSong.artist)
    else toast('没有下一首')
  }

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <footer className="bottom-player">
      <div className="bp-song">
        <div className="bp-thumb" style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover' } : undefined} />
        <div className="bp-meta">
          <strong>{currentSong}</strong>
          <span>{currentArtist}{currentAlbum ? ` · ${currentAlbum}` : ''}</span>
        </div>
      </div>

      <div className="bp-center">
        <div
          className="ember-progress"
          ref={progressRef}
          role="slider"
          tabIndex={0}
          aria-label="播放进度"
          style={{ '--progress': `${pct}%` } as React.CSSProperties}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        >
          <div className="ember-progress__ambient" />
          <div className="ember-progress__track" />
          <div className="ember-progress__remaining" />
          <div className="ember-progress__bars">
            {Array.from({ length: 48 }, (_, i) => <i key={i} className="ember-progress__bar" />)}
          </div>
          <div className="ember-progress__played" />
          <button className="ember-progress__thumb" aria-label="拖动播放位置" />
        </div>
        <div className="time-row">
          <span>{currentTimeLabel}</span>
          <span>{durationLabel}</span>
        </div>
      </div>

      <div className="bp-controls">
        <button className="bp-btn" onClick={prev} title="上一首">◀◀</button>
        <button className="play-main bp-play" onClick={togglePlay}>{isPlaying ? 'Ⅱ' : '▶'}</button>
        <button className="bp-btn" onClick={next} title="下一首">▶▶</button>
        <button
          className={`bp-btn like${isFav ? ' on' : ''}`}
          onClick={() => { toggleLike(); toast(isFav ? '已取消收藏' : '已收藏') }}
          title="喜欢"
        >
          {isFav ? '♥' : '♡'}
        </button>
        <div className="volume-control">
          <svg className="volume-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
            {volume > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7M17.8 6.2a8 8 0 0 1 0 11.6" />}
          </svg>
          <div className="volume-track" ref={volRef} onPointerDown={onVolDown} onPointerMove={onVolMove} onPointerUp={onVolUp}>
            <i className="volume-fill" style={{ width: `${volume * 100}%` }} />
            <i className="volume-dot" style={{ left: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </footer>
  )
}
export default BottomPlayer
