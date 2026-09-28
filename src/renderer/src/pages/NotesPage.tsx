import { PageHeader } from '@renderer/components/ui'
import { Placeholder } from '@renderer/components/Placeholder'
import { IMG } from '@renderer/data/ember'
const notes = [
  { date: '16 OCT 1974 · 04:17', title: 'THE MOUNTAIN WAS QUIET TODAY.', body: '但在岩石下面，大地仍然缓慢地移动。远处的风穿过山谷，像一首没有结尾的长音。' },
  { date: '04 MAR 1982 · 18:43', title: 'LIGHT AFTER RAIN.', body: '雨停以后，窗边的声音突然变得很近。空气里有湿石头、旧木头和一点海的味道。' },
  { date: '22 JUN 1998 · 21:06', title: 'SOME SOUNDS NEVER COOL.', body: '它们不会真正离开，只是从前景退到记忆里。' }
]
export function NotesPage(): JSX.Element {
  return (
    <main className="main">
      <div className="container">
        <PageHeader
          kicker="OBSERVATIONS / MEMORY"
          title="Field Notes"
          desc="有些音乐像风景，有些风景像音乐。这里记录它们相遇的时刻。"
        />
        <section className="section notes-grid">
          <div>
            {notes.map((n) => (
              <article className="note" key={n.title}>
                <div className="note-date">{n.date}</div>
                <h2>{n.title}</h2>
                <p>{n.body}</p>
              </article>
            ))}
          </div>
          <aside className="note-side">
            <Placeholder img={IMG.playlist(4)} />
          </aside>
        </section>
      </div>
    </main>
  )
}
export default NotesPage
