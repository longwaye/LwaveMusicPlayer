/**
 * 共享歌曲数据与图片映射
 */
export interface Song {
  num: string
  name: string
  artist: string
  album: string
  year: string
  time: string
  img: string
}
/** 图片资产 */
export const IMG = {
  hero: '/ember/hero.jpg',
  avatar: '/ember/avatar.jpg',
  queue: (i: number) => `/ember/queue-${String(i).padStart(2, '0')}.jpg`,
  playlist: (i: number) => `/ember/playlist-${String(i).padStart(2, '0')}.jpg`
}
/** 歌曲库 */
export const songs: Song[] = [
  { num: '01', name: 'The Big Ship', artist: 'Brian Eno', album: 'Ambient 1', year: '2006', time: '04:31', img: IMG.queue(1) },
  { num: '02', name: 'An Ending', artist: 'Brian Eno', album: 'Another Green World', year: '1975', time: '04:20', img: IMG.queue(2) },
  { num: '03', name: 'Weightless', artist: 'Marconi Union', album: 'Ambient Zone', year: '2009', time: '08:03', img: IMG.queue(3) },
  { num: '04', name: 'River', artist: 'Ólafur Arnalds', album: 're:member', year: '2018', time: '04:56', img: IMG.queue(4) },
  { num: '05', name: 'Only Time', artist: 'Enya', album: 'A Day Without Rain', year: '2000', time: '03:39', img: IMG.queue(5) },
  { num: '06', name: '2/1', artist: 'Brian Eno', album: 'Ambient 1', year: '2006', time: '08:30', img: IMG.playlist(2) },
  { num: '07', name: '1/1', artist: 'Brian Eno', album: 'Ambient 1', year: '2006', time: '17:20', img: IMG.playlist(3) },
  { num: '08', name: 'The Moon', artist: '久石让', album: 'Works II', year: '1994', time: '05:12', img: IMG.playlist(4) }
]
/** 专辑（我的音乐 / 专辑详情） */
export interface Album {
  name: string
  artist: string
  year: string
  img: string
  tracks: Song[]
}
export const albums: Album[] = [
  { name: 'Ambient 1', artist: 'Brian Eno · 1978', year: '2006', img: IMG.playlist(1), tracks: songs.filter((s) => s.album === 'Ambient 1') },
  { name: 'Play', artist: 'Moby · 1999', year: '1999', img: IMG.playlist(2), tracks: songs.slice(0, 3) },
  { name: 're:member', artist: 'Ólafur Arnalds · 2018', year: '2018', img: IMG.playlist(3), tracks: songs.filter((s) => s.album === 're:member') },
  { name: 'A Day Without Rain', artist: 'Enya · 2000', year: '2000', img: IMG.playlist(4), tracks: songs.filter((s) => s.album === 'A Day Without Rain') }
]
/** 聆听旅程（播放列表） */
export interface Journey {
  name: string
  meta: string
  img: string
}
export const journeys: Journey[] = [
  { name: 'FOR THE NIGHT', meta: '14 首 · 62 分钟 · 夜晚 / 安静 / 深度聆听', img: IMG.playlist(1) },
  { name: 'VOLCANIC WEATHER', meta: '8 首 · 31 分钟 · 地质 / 风 / 低温', img: IMG.playlist(2) },
  { name: 'THE LONG ROAD', meta: '10 首 · 42 分钟 · 公路 / 远方 / 日落', img: IMG.playlist(3) },
  { name: 'MORNING LIGHT', meta: '12 首 · 47 分钟 · 清晨 / 雾 / 光', img: IMG.playlist(4) },
  { name: 'SUMMER MEMORY', meta: '16 首 · 73 分钟 · 海 / 风 / 记忆', img: IMG.playlist(5) },
  { name: 'FIELD NOTES', meta: '10 首 · 38 分钟 · 自然 / 观察 / 文字', img: IMG.queue(5) }
]
/** 收藏歌曲 */
export const favorites = [songs[0], songs[3], songs[4]]
/** 首页播放队列（对应静态站 index.html） */
export const homeQueue: Song[] = [
  { num: '01', name: 'The Big Ship', artist: 'Brian Eno', album: 'Ambient 1', year: '2006', time: '04:31', img: IMG.queue(1) },
  { num: '02', name: 'Alone in Kyoto', artist: 'Air', album: 'Talkie Walkie', year: '2003', time: '03:56', img: IMG.queue(2) },
  { num: '03', name: 'An Ending', artist: 'Brian Eno', album: 'Another Green World', year: '1975', time: '04:20', img: IMG.queue(3) },
  { num: '04', name: 'Teardrop', artist: 'Massive Attack', album: 'Mezzanine', year: '1998', time: '05:31', img: IMG.queue(4) },
  { num: '05', name: 'Somewhere', artist: 'M83', album: 'Before the Dawn Heals Us', year: '2005', time: '05:21', img: IMG.queue(5) }
]
/** 首页推荐歌单 */
export const homePlaylists: Journey[] = [
  { name: 'Morning Light', meta: '12 首 · 47 分钟', img: IMG.playlist(1) },
  { name: 'Volcanic Weather', meta: '8 首 · 31 分钟', img: IMG.playlist(2) },
  { name: 'For the Night', meta: '14 首 · 62 分钟', img: IMG.playlist(3) },
  { name: 'Field Notes', meta: '10 首 · 38 分钟', img: IMG.playlist(4) },
  { name: 'Summer Memory', meta: '16 首 · 73 分钟', img: IMG.playlist(5) }
]
