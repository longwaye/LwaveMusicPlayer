/**
 * 应用根组件：布局与页面路由
 */
import { AppProvider, useApp } from './context/AppContext'
import { Sidebar, MobileNav, BottomPlayer } from './components'
import {
  HomePage,
  SearchPage,
  LibraryPage,
  FavoritesPage,
  PlaylistsPage,
  PlaylistDetailPage,
  AlbumPage,
  NotesPage,
  SettingsPage
} from './pages'
import type { Route } from './context/AppContext'
const routes: Record<Route, () => JSX.Element> = {
  home: HomePage,
  search: SearchPage,
  library: LibraryPage,
  favorites: FavoritesPage,
  playlists: PlaylistsPage,
  'playlist-detail': PlaylistDetailPage,
  album: AlbumPage,
  notes: NotesPage,
  settings: SettingsPage
}
function Shell(): JSX.Element {
  const { route, themeDark } = useApp()
  const Page = routes[route]
  return (
    <div className={`app${themeDark ? ' theme-dark' : ''}`}>
      <Sidebar />
      {/* 非首页时显示全局底部播放条（功能与首页播放区一致） */}
      {route !== 'home' && <BottomPlayer />}
      <div className={route === 'home' ? '' : 'with-player'}>
        <Page />
      </div>
      <MobileNav />
      <div className="toast" />
    </div>
  )
}
export default function App(): JSX.Element {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
