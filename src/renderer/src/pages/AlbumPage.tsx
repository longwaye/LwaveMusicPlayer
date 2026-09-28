import { useApp } from '@renderer/context/AppContext'
import { SectionHead, SongTable } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { albums } from '@renderer/data/ember'
export function AlbumPage(): JSX.Element {
  const { play, toast } = useApp()
  const album = albums[0]
  return (
    <main className="main">
      <div className="container">
        <section className="album-hero">
          <Placeholder ph="1" img={album.img} className="album-cover" />
          <div className="album-info">
            <div className="eyebrow">ALBUM · 2006</div>
            <h1>Ambient 1:<br />Music for Airports</h1>
            <div className="artist">Brian Eno</div>
            <div className="meta">AMBIENT · 4 TRACKS · 48 MINUTES</div>
            <div className="album-actions">
              <button className="btn primary" onClick={() => { play('The Big Ship', undefined, 'Brian Eno'); toast('正在播放 · The Big Ship') }}>
                PLAY ALBUM →
              </button>
              <button className="btn" onClick={() => toast('已收藏')}>♡ SAVE</button>
            </div>
          </div>
        </section>
        <section className="section">
          <SectionHead title="TRACKLIST" />
          <SongTable rows={album.tracks} />
        </section>
      </div>
    </main>
  )
}
export default AlbumPage
