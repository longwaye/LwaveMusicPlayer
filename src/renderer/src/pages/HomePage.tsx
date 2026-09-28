import { useApp } from '@renderer/context/AppContext'
import { HeroSearchBox } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG, homeQueue } from '@renderer/data/ember'
export function HomePage(): JSX.Element {
  const { toast, liked, toggleLike, currentSong, localSongs, isPlaying, togglePlay, currentTimeLabel, durationLabel, currentTime, duration } = useApp()
  // 歌词：默认在已导入的本地歌曲中查找；未找到则提示联网搜索（待实现）
  const lyrics = localSongs.find((s) => s.name === currentSong)?.lyrics
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  return (
    <main className="main home-main">
      {/* HERO / NOW PLAYING */}
      <section className="hero">
        <Placeholder ph="hero" img={IMG.hero} className="hero-image" />
        <div className="hero-content">
          <HeroSearchBox />
          <div className="hero-main">
            <div className="hero-head">
              <div className="hero-kicker">NOW PLAYING</div>
              <h1 className="hero-title">{currentSong}</h1>
              <div className="hero-artist">Brian Eno</div>
              <div className="hero-meta">
                <span className="hero-rule" />
                <span>Ambient · 2006</span>
              </div>
            </div>
            {/* 歌词展示区：优先本地歌曲，无则联网搜索（待实现） */}
            <div className="lyrics-area">
              {lyrics ? (
                <div className="lyrics-text">{lyrics}</div>
              ) : (
                <div className="lyrics-placeholder">暂无歌词 · 联网搜索待开通</div>
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
              </div>
            </div>
          </div>
        </div>
        {/* PLAY QUEUE */}
        <aside className="queue">
          <h2 className="queue-title">Ⅰ　播放队列</h2>
          {homeQueue.map((t) => (
            <div className="queue-row" key={t.num}>
              <span>{t.num}</span>
              <Placeholder img={t.img} />
              <div>
                <b>{t.name}</b>
                <small>{t.artist}</small>
              </div>
              <time>{t.time}</time>
            </div>
          ))}
        </aside>
      </section>
    </main>
  )
}
export default HomePage
