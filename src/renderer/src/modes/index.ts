/**
 * 播放器展示模式
 * 三种状态共享同一视觉语言（同一件艺术品的不同切面）：
 *   - artwork 封面沉浸（静置）
 *   - lyrics   全屏歌词
 *   - compact  迷你 / 胶片帧
 */
export type PlayerMode = 'artwork' | 'lyrics' | 'compact'

export const PLAYER_MODES: readonly PlayerMode[] = ['artwork', 'lyrics', 'compact']

export const MODE_LABEL: Record<PlayerMode, string> = {
  artwork: '封面沉浸',
  lyrics: '全屏歌词',
  compact: '迷你'
}
