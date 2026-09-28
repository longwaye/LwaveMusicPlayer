import { useApp } from '@renderer/context/AppContext'
import { SectionHead, SongTable } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG, songs } from '@renderer/data/ember'
export function PlaylistDetailPage(): JSX.Element {
  const { play, toast } = useApp()
  return (
    <main className="main">
      <div className="container">
        <section className="album-hero">
          <Placeholder ph="2" img={IMG.playlist(2)} className="album-cover" />
          <div className="album-info">
            <div className="eyebrow">CURATED JOURNEY · 08 SONGS</div>
            <h1>Volcanic<br />Weather</h1>
            <div className="artist">EMBER EDITORIAL</div>
            <div className="meta">31 MINUTES · 2026</div>
            <div className="album-actions">
              <button className="btn primary" onClick={() => { play('The Big Ship'); toast('正在播放 · The Big Ship') }}>
                PLAY JOURNEY →
              </button>
              <button className="btn" onClick={() => toast('已加入播放列表')}>＋ SAVE</button>
            </div>
          </div>
        </section>
        <section className="section">
          <SectionHead title="TRACKS" />
          <SongTable rows={songs.slice(0, 4)} showAlbum={false} />
        </section>
      </div>
    </main>
  )
}
export default PlaylistDetailPage
