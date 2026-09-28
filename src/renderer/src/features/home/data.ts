/**
 * 首页 mock 数据
 * 图片资源：/ember/*.jpg
 */

/** 侧边导航（7 项，含设置） */
export const navItems = [
  { label: '首页', icon: '⌂', active: true },
  { label: '探索', icon: '⌕' },
  { label: '我的音乐', icon: '♫' },
  { label: '我的收藏', icon: '♡' },
  { label: '播放列表', icon: '☷' },
  { label: '手记', icon: '▤' },
  { label: '设置', icon: '⚙' }
]

/** Hero / Now Playing */
export const hero = {
  eyebrow: 'NOW PLAYING',
  title: 'The Big Ship',
  artist: 'Brian Eno',
  meta: 'Ambient · 2006',
  image: '/ember/hero.jpg'
}

/** 播放队列（5 首） */
export const queue = [
  { num: '01', title: 'The Big Ship', artist: 'Brian Eno', time: '04:31', img: '/ember/queue-01.jpg', current: true },
  { num: '02', title: 'Alone in Kyoto', artist: 'Air', time: '03:56', img: '/ember/queue-02.jpg' },
  { num: '03', title: 'An Ending', artist: 'Brian Eno', time: '04:20', img: '/ember/queue-03.jpg' },
  { num: '04', title: 'Teardrop', artist: 'Massive Attack', time: '05:31', img: '/ember/queue-04.jpg' },
  { num: '05', title: 'Somewhere', artist: 'M83', time: '05:21', img: '/ember/queue-05.jpg' }
]

/** 推荐歌单（5 张） */
export const playlists = [
  { name: 'Morning Light', meta: '12 首 · 47 分钟', img: '/ember/playlist-01.jpg' },
  { name: 'Volcanic Weather', meta: '8 首 · 31 分钟', img: '/ember/playlist-02.jpg' },
  { name: 'For the Night', meta: '14 首 · 62 分钟', img: '/ember/playlist-03.jpg' },
  { name: 'Field Notes', meta: '10 首 · 38 分钟', img: '/ember/playlist-04.jpg' },
  { name: 'Summer Memory', meta: '16 首 · 73 分钟', img: '/ember/playlist-05.jpg' }
]

/** 播放器 / 时间线 */
export const player = {
  currentTime: '03:17',
  totalTime: '04:31',
  progress: 52
}

/** 侧边栏诗句 */
export const note = {
  lines: ['有些声音', '不会冷却，', '它们只会沉淀。'],
  sign: '— EMBER'
}

/** 右上头像图 */
export const avatarImg = '/ember/avatar.jpg'
