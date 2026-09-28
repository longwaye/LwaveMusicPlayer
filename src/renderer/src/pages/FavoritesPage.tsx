import { useApp } from '@renderer/context/AppContext'
import { PageHeader, SectionHead } from '@renderer/components/ui'
export function FavoritesPage(): JSX.Element {
  const { play, toast, likedSongs, removeLiked } = useApp()
  return (
    <main className="main">
      <div className="container">
        <PageHeader kicker="COLLECTED" title="Favorites" desc="那些你不想让时间带走的声音。" />
        <section className="section">
          <SectionHead title={`收藏的歌曲 · ${likedSongs.length}`} />
          <div className="local-song-list">
            {likedSongs.map((s) => (
              <div key={'fav-' + s.name} className="local-song-row">
                <button className="local-song-play" onClick={() => { play(s.name, s.path, s.artist); toast('正在播放 · ' + s.name) }}>▶</button>
                <button className="local-song-body" onClick={() => { play(s.name, s.path, s.artist); toast('正在播放 · ' + s.name) }}>
                  <div className="local-song-meta">
                    <b>{s.name}</b>
                    <small>{s.artist || '未知歌手'}</small>
                  </div>
                </button>
                <button className="local-song-remove" title="取消收藏" onClick={() => { removeLiked(s.name); toast('已取消收藏') }}>×</button>
              </div>
            ))}
          </div>
          {likedSongs.length === 0 && <p className="local-empty">还没有收藏歌曲。点击播放器上的爱心把声音留下来。</p>}
        </section>
      </div>
    </main>
  )
}
export default FavoritesPage
