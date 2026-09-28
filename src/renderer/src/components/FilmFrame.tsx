/**
 * FilmFrame — 电影画面框
 * 依据规范 12 / 25 节：Now Playing 的核心视觉是 Film Frame。
 * 特点：极细边框、比例（16:10 / 3:2 / 4:3，不默认 1:1）、克制的胶片感。
 * 可传入电影画面作为子内容；不做故障艺术、不做强烈发光。
 */
import type { CSSProperties, ReactNode } from 'react'

export type FilmRatio = '16:10' | '3:2' | '4:3'

const RATIO: Record<FilmRatio, number> = {
  '16:10': 16 / 10,
  '3:2': 3 / 2,
  '4:3': 4 / 3
}

interface FilmFrameProps {
  ratio?: FilmRatio
  /** 电影画面 / 图片内容 */
  children?: ReactNode
  /** 是否显示极细内边线（胶片门暗示） */
  gate?: boolean
  style?: CSSProperties
}

export function FilmFrame({
  ratio = '16:10',
  children,
  gate = true,
  style
}: FilmFrameProps): JSX.Element {
  const frameStyle: CSSProperties = {
    position: 'relative',
    aspectRatio: String(RATIO[ratio]),
    width: '100%',
    overflow: 'hidden',
    border: '1px solid var(--fg-faint)',
    background: 'var(--bg-surface)',
    ...style
  }

  return (
    <div className="film-frame" style={frameStyle}>
      {children}
      {gate && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 6,
            border: '1px solid color-mix(in srgb, var(--fg-faint) 45%, transparent)',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  )
}

export default FilmFrame
