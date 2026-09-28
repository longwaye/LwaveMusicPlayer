import type { Route } from '@renderer/context/AppContext'
export interface NavEntry {
  route: Route
  icon: string
  label: string
}
/** 侧栏 6 项导航（手记暂隐藏） */
export const sidebarNav: NavEntry[] = [
  { route: 'home', icon: '⌂', label: '首页' },
  { route: 'search', icon: '⌕', label: '搜索' },
  { route: 'playlists', icon: '☷', label: '播放列表' },
  { route: 'favorites', icon: '♡', label: '我的收藏' },
  { route: 'library', icon: '♫', label: '本地音乐' },
  { route: 'settings', icon: '⚙', label: '设置' }
]
/** 移动端底部 5 项导航 */
export const mobileNav: NavEntry[] = [
  { route: 'home', icon: '⌂', label: '首页' },
  { route: 'search', icon: '⌕', label: '搜索' },
  { route: 'playlists', icon: '☷', label: '播放列表' },
  { route: 'favorites', icon: '♡', label: '我的收藏' },
  { route: 'library', icon: '♫', label: '本地音乐' }
]
/** 侧栏诗句 */
export const noteLines = ['有些声音', '不会冷却，', '它们只会沉淀。']
export const noteSign = '— EMBER'
