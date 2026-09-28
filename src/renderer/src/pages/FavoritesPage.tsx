import { PageHeader, SectionHead, SongTable } from '@renderer/components/ui'
import { favorites } from '@renderer/data/ember'
export function FavoritesPage(): JSX.Element {
  return (
    <main className="main">
      <div className="container">
        <PageHeader kicker="COLLECTED" title="Favorites" desc="那些你不想让时间带走的声音。" />
        <section className="section">
          <SectionHead title="收藏的歌曲 · 24" />
          <SongTable rows={favorites} action="like" />
        </section>
      </div>
    </main>
  )
}
export default FavoritesPage
