/**
 * EMBER 共享 UI 小块：页面头、区块头、专辑卡、歌曲表、Hero 搜索
 */
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Placeholder } from './Placeholder'
import { useApp } from '@renderer/context/AppContext'
import type { Song } from '@renderer/data/ember'

/** 页面头 */
export function PageHeader({ kicker, title, desc }: { kicker: string; title: string; desc?: string }): JSX.Element {
  return (
    <header className="page-header">
      <div>
        <div className="page-kicker">{kicker}</div>
        <h1 className="page-title">{title}</h1>
      </div>
      {desc && <p className="page-desc">{desc}</p>}
    </header>
  )
}

/** 区块头 */
export function SectionHead({
  title,
  linkLabel,
  onLink
}: {
  title: string
  linkLabel?: string
  onLink?: () => void
}): JSX.Element {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      {linkLabel &&
        (onLink ? (
          <a href="#" className="section-link" onClick={(e) => { e.preventDefault(); onLink() }}>
            {linkLabel}
          </a>
        ) : (
          <span className="section-link">{linkLabel}</span>
        ))}
    </div>
  )
}

/** 专辑卡 */
export function AlbumCard({
  img,
  title,
  meta,
  onClick,
  phStyle
}: {
  img: string
  title: string
  meta: string
  onClick?: () => void
  /** 可选覆盖占位图高度（如热门搜索的 130px） */
  phStyle?: React.CSSProperties
}): JSX.Element {
  return (
    <a href="#" className="album-card" onClick={(e) => { e.preventDefault(); onClick?.() }}>
      <Placeholder img={img} style={phStyle} />
      <h3>{title}</h3>
      <p>{meta}</p>
    </a>
  )
}

/** 歌曲表 */
export function SongTable({
  rows,
  action = 'play',
  showAlbum = true
}: {
  rows: Song[]
  action?: 'play' | 'like'
  /** 是否显示专辑列（专辑详情有，歌单详情无） */
  showAlbum?: boolean
}): JSX.Element {
  const { play, toast, liked, toggleLike } = useApp()

  const onAction = (song: Song) => {
    if (action === 'play') {
      play(song.name)
      toast('正在播放 · ' + song.name)
    } else {
      toggleLike()
      toast(liked ? '已取消收藏' : '已收藏')
    }
  }

  return (
    <table className="song-table">
      <thead>
        <tr>
          <th>#</th>
          <th>歌曲</th>
          <th>艺术家</th>
          {showAlbum && <th>专辑</th>}
          <th>时长</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => (
          <tr key={s.num + s.name}>
            <td>{s.num}</td>
            <td>
              <div className="song-title-cell">
                <Placeholder img={s.img} className="song-thumb" />
                <div>
                  <span className="song-name">{s.name}</span>
                  <span className="song-sub">{s.artist}</span>
                </div>
              </div>
            </td>
            <td>{s.artist}</td>
            {showAlbum && <td>{s.album}</td>}
            <td>{s.time}</td>
            <td className="icon-cell">
              <button className={action === 'like' ? (liked ? 'js-like liked' : 'js-like') : ''} onClick={() => onAction(s)}>
                {action === 'play' ? '▶' : '♥'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Hero 搜索框 + 右上角操作 */
export function HeroSearchBox({ defaultValue }: { defaultValue?: string }): JSX.Element {
  const { navigate, toggleTheme, toast } = useApp()
  const [q, setQ] = useState(defaultValue ?? '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const query = q.trim()
    if (query) navigate('search', query)
    else toast('请输入歌曲、专辑或艺术家')
  }

  return (
    <div className="hero-top">
      <form className="search-box hero-search" data-search onSubmit={submit}>
        <span className="search-icon">⌕</span>
        <input placeholder="搜索歌曲、专辑、艺术家..." value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <div className="hero-actions">
        <button onClick={() => { toggleTheme(); toast('EMBER 主题') }}>☼</button>
        <b>|</b>
        <span className="avatar" style={{ backgroundImage: "url('/ember/avatar.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </div>
    </div>
  )
}
