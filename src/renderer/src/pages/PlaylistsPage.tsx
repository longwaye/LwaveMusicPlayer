import { useApp } from '@renderer/context/AppContext'
import { AlbumCard, PageHeader } from '@renderer/components/ui'
import { journeys } from '@renderer/data/ember'
export function PlaylistsPage(): JSX.Element {
  const { navigate } = useApp()
  return (
    <main className="main">
      <div className="container">
        <PageHeader
          kicker="CURATED LISTENING EXPERIENCES"
          title="Journeys"
          desc="不是歌单，而是一段段有方向的聆听旅程。"
        />
        <section className="section">
          <div className="grid-3">
            {journeys.map((j) => (
              <AlbumCard key={j.name} img={j.img} title={j.name} meta={j.meta} onClick={() => navigate('playlist-detail')} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
export default PlaylistsPage
