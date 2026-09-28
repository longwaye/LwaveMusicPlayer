/**
 * 网易云 API 模块汇总 + IPC 注册
 *
 * LWAVE 当前仅按需封装三个模块：
 *   - 歌词  /lyric/new           （联网搜索歌词）
 *   - 搜索  /cloudsearch         （综合搜索）
 *   - 歌曲  /song/detail、/song/url/v1 （云歌曲详情与播放链接，备用）
 *
 * 未封装：登录/账号、歌单/专辑、榜单、MV、电台、推荐、音源解析、远程控制。
 * 通过 window.api.netease.* 暴露给渲染进程（主进程侧请求，无 CORS/CSP 问题）。
 */
import { ipcMain } from 'electron'
import { getLyric } from './lyric'
import { search, searchHot } from './search'
import { getSongDetail, getSongUrl } from './song'
import { downloadSong, downloadLyric } from './download'

export function registerNeteaseHandlers(): void {
  ipcMain.handle('netease:lyric', (_e, id: number | string) => getLyric(id))
  ipcMain.handle('netease:search-hot', () => searchHot())
  ipcMain.handle(
    'netease:search',
    (_e, keywords: string, type = 1, limit = 30, offset = 0) =>
      search({ keywords, type, limit, offset })
  )
  ipcMain.handle('netease:song-detail', (_e, ids: string | number | (string | number)[]) => getSongDetail(ids))
  ipcMain.handle('netease:song-url', (_e, id: number | string, level?: string) => getSongUrl(id, level))
  ipcMain.handle('netease:download-song', (_e, id: number | string, name: string) => downloadSong(id, name))
  ipcMain.handle('netease:download-lyric', (_e, id: number | string, name: string) => downloadLyric(id, name))
}
