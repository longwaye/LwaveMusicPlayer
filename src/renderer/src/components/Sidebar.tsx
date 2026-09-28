import { useApp } from '@renderer/context/AppContext'
import { sidebarNav } from './nav'
export function Sidebar(): JSX.Element {
  const { route, navigate } = useApp()
  return (
    <aside className="sidebar">
      <a href="#" className="brand" onClick={(e) => { e.preventDefault(); navigate('home') }}>
        <div className="brand__word"><span>E</span> M B E R</div>
        <div className="brand__tag">LISTEN DEEPLY.</div>
      </a>
      <nav className="nav">
        {sidebarNav.map((it) => (
          <a
            key={it.route}
            href="#"
            className={`nav-item${route === it.route ? ' active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate(it.route) }}
          >
            <i>{it.icon}</i>
          </a>
        ))}
      </nav>
      <div className="sidebar-format"><b />16MM</div>
    </aside>
  )
}
