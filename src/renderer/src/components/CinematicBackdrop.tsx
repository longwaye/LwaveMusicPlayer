/**
 * CinematicBackdrop — 电影静帧背景层
 * 机制：
 *   - 支持传入真实电影图 src
 *   - 无图时用暖调渐变 + 色罩模拟"电影静帧"氛围
 *   - 统一做低饱和 / 压暗 / 暖色校正
 * 覆盖层强度可随主题（ASH→EMBER）变化：浅色主题更亮，深色主题压得更暗。
 */
import type { CSSProperties } from 'react'

interface CinematicBackdropProps {
  /** 电影图地址（可选）；未提供时使用暖调渐变占位 */
  src?: string
  alt?: string
  /** 0–1，压暗强度（深色主题可加大） */
  dim?: number
  style?: CSSProperties
}

export function CinematicBackdrop({
  src,
  alt = '',
  dim = 0.5,
  style
}: CinematicBackdropProps): JSX.Element {
  const layer: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
    ...style
  }

  return (
    <div aria-hidden className="cinematic-backdrop" style={layer}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(0.78) contrast(1.04) sepia(0.12)'
          }}
        />
      ) : (
        <div className="cinematic-fallback" />
      )}
      {/* 暖色罩：统一压暗 + 柔和色偏，营造电影感 */}
      <div
        className="cinematic-shade"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--bg) 35%, transparent), color-mix(in srgb, var(--bg) 78%, transparent))'
        }}
      />
      {/* 暗角叠层：由 dim 控制压暗程度 */}
      <div
        className="cinematic-dim"
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(18, 14, 10, ${dim})`
        }}
      />
    </div>
  )
}

export default CinematicBackdrop
