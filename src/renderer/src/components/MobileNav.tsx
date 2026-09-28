/**
 * 移动端底部导航（≤900px 显示）
 */
import { useApp } from '@renderer/context/AppContext'
import { mobileNav } from './nav'

export function MobileNav(): JSX.Element {
  const { route, navigate } = useApp()
  return (
    <nav className="mobile-nav">
      {mobileNav.map((it) => (
        <a
          key={it.route}
          href="#"
          className={route === it.route ? 'active' : ''}
          onClick={(e) => { e.preventDefault(); navigate(it.route) }}
        >
          <span>{it.icon}</span>
          <small>{it.label}</small>
        </a>
      ))}
    </nav>
  )
}
