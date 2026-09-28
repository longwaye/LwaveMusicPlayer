/**
 * 本地音乐（原"我的音乐"）
 * 手动导入的本地歌曲与内置曲库合并展示；支持多文件导入。
 */
import { useApp } from '@renderer/context/AppContext'
import { PageHeader, SectionHead } from '@renderer/components/ui'
import { songs } from '@renderer/data/ember'

export function LibraryPage(): JSX.Element {
  const { play, toast, localSongs, importLocalFiles } = useApp()

  return (
    <main className="main">
      <div className="container">
        <PageHeader
          kicker="LOCAL MUSIC"
          title="本地音乐"
          desc="把听过的声音保存下来。它们会慢慢变成一份关于时间的索引。"
        />

        <section className="section">
          <SectionHead title="全部歌曲" linkLabel="＋ 手动导入" onLink={() => importLocalFiles()} />

          <div className="local-song-list">
            {/* 本地导入的歌曲：真实播放本地文件 */}
            {localSongs.map((s) => (
              <button
                key={'loc-' + s.path}
                className="local-song-row"
                onClick={() => { play(s.name, s.path); toast('正在播放 · ' + s.name) }}
              >
                <span className="local-song-play">▶</span>
                <div className="local-song-meta">
                  <b>{s.name} <em className="local-tag">本地</em></b>
                  <small>{s.path}</small>
                </div>
              </button>
            ))}
            {/* 内置曲库歌曲 */}
            {songs.map((s) => (
              <button
                key={'lib-' + s.name}
                className="local-song-row"
                onClick={() => { play(s.name); toast('正在播放 · ' + s.name) }}
              >
                <span className="local-song-play">▶</span>
                <div className="local-song-meta">
                  <b>{s.name}</b>
                  <small>{s.artist}</small>
                </div>
              </button>
            ))}
          </div>

          {localSongs.length === 0 && (
            <p className="local-empty">还没有导入本地歌曲。点击"手动导入"选择你的音乐文件。</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default LibraryPage
