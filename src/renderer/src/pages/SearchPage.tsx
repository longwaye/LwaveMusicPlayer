import { useApp } from '@renderer/context/AppContext'
import { AlbumCard, HeroSearchBox, SectionHead } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG, songs } from '@renderer/data/ember'
const hotSearches = [
  { title: 'The Big Ship', meta: 'Brian Eno', img: IMG.playlist(1) },
  { title: 'Ambient', meta: '氛围音乐', img: IMG.playlist(2) },
  { title: 'Lost in Winter', meta: '冬日氛围', img: IMG.playlist(3) },
  { title: 'Nature Sounds', meta: '自然之声', img: IMG.playlist(4) }
]
export function SearchPage(): JSX.Element {
  const { searchQuery, navigate } = useApp()
  return (
    <main className="main">
      <div className="search-hero" style={{ minHeight: 330, position: 'relative', overflow: 'hidden' }}>
        <Placeholder ph="hero" img={IMG.hero} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(30,30,27,.18),transparent 65%)' }} />
        <div className="hero-content" style={{ paddingTop: 31 }}>
          <HeroSearchBox defaultValue={searchQuery} />
          <div className="hero-main" style={{ marginTop: 'auto', paddingBottom: 5 }}>
            <div className="hero-kicker">SEARCH</div>
            <h1 className="hero-title" style={{ fontSize: 64 }}>Search</h1>
            <div className="hero-artist" style={{ fontSize: 17 }}>在声音中，找到你想要的风景。</div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="section" style={{ paddingTop: 25 }}>
          <SectionHead title="热门搜索" linkLabel="查看更多 →" />
          <div className="grid-4">
            {hotSearches.map((h) => (
              <AlbumCard key={h.title} img={h.img} title={h.title} meta={h.meta} phStyle={{ height: 130 }} onClick={() => navigate('album')} />
            ))}
          </div>
        </div>
        <div className="section">
          <SectionHead title="搜索结果" />
          <div className="search-results">
            {songs.slice(0, 6).map((s, i) => (
              <div className="result-row" key={i}>
                <span>{s.num}</span>
                <div className="result-title">
                  <Placeholder img={s.img} />
                  <b>{s.name}</b>
                </div>
                <span>{s.artist}</span>
                <time>{s.time}</time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
export default SearchPage
