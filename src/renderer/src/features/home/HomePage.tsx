/**
 * 首页 — 依据 EMBER-reference-reconstruction 包（03_EMBER_HOME.html + 04_EMBER_HOME.css）忠实还原。
 * 视觉基准：1536×1024，Hero 全屏电影画面，暖纸编辑风。
 * 图片当前为纯色占位（/ember/*.jpg），后续替换真实电影静帧。
 */
import './ember-home.css'
import { navItems, hero, queue, playlists, player, note, avatarImg } from './data'
import type { CSSProperties } from 'react'

/** 背景图辅助：cover 填充 */
const bg = (url: string): CSSProperties => ({
  backgroundImage: `url('${url}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
})

export function HomePage(): JSX.Element {
  return (
    <div className="ember">
      {/* ============ LEFT EDITORIAL SIDEBAR ============ */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__word">
            <span>E</span>M B E R
          </div>
          <div className="brand__tag">LISTEN DEEPLY.</div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((it) => (
            <a key={it.label} href="#" className={`nav-item${it.active ? ' is-active' : ''}`}>
              <span className="nav-icon">{it.icon}</span>
              <span>{it.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar__note">
          <p>
            {note.lines.map((l, i) => (
              <span key={i}>
                {l}
                {i < note.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <span>{note.sign}</span>
        </div>

        <div className="sidebar__format">
          <i />
          16MM
        </div>
      </aside>

      {/* ============ MAIN PAGE ============ */}
      <main className="main">
        {/* TOP UTILITY */}
        <header className="topbar">
          <div className="search">
            <span className="search__icon">⌕</span>
            <span>搜索歌曲、专辑、艺术家...</span>
          </div>
          <div className="topbar__right">
            <span className="sun">☼</span>
            <span className="topbar__divider" />
            <span className="avatar" style={bg(avatarImg)} />
          </div>
        </header>

        {/* HERO / NOW PLAYING */}
        <section className="hero">
          <div className="hero__visual" style={bg(hero.image)} />
          <div className="hero__wash" />
          <div className="hero__grain" />

          <div className="hero__info">
            <div className="eyebrow">{hero.eyebrow}</div>
            <h1>{hero.title}</h1>
            <div className="artist">{hero.artist}</div>
            <div className="hero__rule" />
            <div className="meta">{hero.meta}</div>

            <div className="hero-actions">
              <button className="round-action is-liked">
                <b>♥</b>
                <span>已收藏</span>
              </button>
              <button className="round-action">
                <b>＋</b>
                <span>添加到播放列表</span>
              </button>
              <button className="round-action">
                <b>···</b>
                <span>更多</span>
              </button>
            </div>
          </div>

          {/* PLAY QUEUE */}
          <aside className="queue">
            <div className="queue__heading">
              <i />
              <strong>播放队列</strong>
            </div>

            {queue.map((t) => (
              <div key={t.num} className={`queue-row${t.current ? ' is-current' : ''}`}>
                <span className="queue-row__num">{t.num}</span>
                <div className="queue-row__thumb" style={bg(t.img)} />
                <div className="queue-row__copy">
                  <strong>{t.title}</strong>
                  <span>{t.artist}</span>
                </div>
                <time>{t.time}</time>
              </div>
            ))}

            <div className="volume">
              <span>♧</span>
              <div className="volume__line">
                <i />
              </div>
            </div>
          </aside>

          {/* TIMELINE */}
          <div className="timeline">
            <span>{player.currentTime}</span>
            <div className="timeline__track">
              <div className="timeline__wave" style={{ width: `${player.progress}%` }} />
              <i className="timeline__dot" style={{ left: `${player.progress}%` }} />
            </div>
            <span>{player.totalTime}</span>
          </div>

          {/* TRANSPORT */}
          <div className="transport">
            <button aria-label="乱序">⌁</button>
            <button aria-label="上一曲">◀</button>
            <button className="transport__play" aria-label="播放 / 暂停">Ⅱ</button>
            <button aria-label="下一曲">▶</button>
            <button aria-label="循环">↻</button>
          </div>
        </section>

        {/* RECOMMENDED PLAYLISTS */}
        <section className="recommend">
          <div className="recommend__heading">
            <div>
              <i />
              <strong>推荐歌单</strong>
            </div>
            <a href="#">查看全部　→</a>
          </div>

          <div className="playlist-grid">
            {playlists.map((p, i) => (
              <article key={p.name} className="playlist">
                <div className={`playlist__image image-${i + 1}`} style={bg(p.img)} />
                <div className="playlist__title">{p.name}</div>
                <div className="playlist__meta">{p.meta}</div>
              </article>
            ))}
          </div>
        </section>

        {/* BOTTOM MINI PLAYER */}
        <footer className="mini-player">
          <div className="mini-player__song">
            <div className="mini-player__thumb" style={bg(queue[0].img)} />
            <div>
              <strong>{queue[0].title}</strong>
              <span>{queue[0].artist}</span>
            </div>
          </div>
          <button className="mini-player__pause" aria-label="暂停">Ⅱ</button>
          <div className="mini-player__mini-wave" />
          <div className="mini-player__brand">—　LISTEN DEEPLY.</div>
        </footer>
      </main>
    </div>
  )
}

export default HomePage
