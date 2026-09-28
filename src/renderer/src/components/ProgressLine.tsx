/**
 * ProgressLine — 地质时间轨迹
 * 依据规范 14 节：不使用 ━━━●━━━ 常规进度条，
 * 而是一条极细、不规则、像地震记录/胶片时间线的"地质时间轨迹"。
 * Played 段为 MAGMA，Unplayed 段为 SMOKE/STONE。
 */
import { useId, type CSSProperties } from 'react'

interface ProgressLineProps {
  /** 0–1 */
  progress?: number
  width?: number | string
  style?: CSSProperties
}

/** 生成一条不规则但确定性的轨迹 path（避免每帧随机，规范 42 节） */
function tracePath(seed = 0): string {
  const n = 12
  const w = 100
  const pts: string[] = []
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w
    // 确定性伪随机（正弦叠加），振幅约 ±0.8
    const y =
      50 +
      2.2 * Math.sin(i * 1.7 + seed) +
      1.4 * Math.sin(i * 3.3 + seed * 2) +
      0.8 * Math.sin(i * 5.1 + seed * 3)
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return `M ${pts.join(' L ')}`
}

export function ProgressLine({ progress = 0, width = '100%', style }: ProgressLineProps): JSX.Element {
  const id = useId()
  const played = Math.min(1, Math.max(0, progress))
  const d = tracePath(0)

  return (
    <svg
      className="progress-line"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ display: 'block', width, height: 18, ...style }}
      aria-hidden
    >
      {/* Unplayed：SMOKE / STONE 细线 */}
      <path d={d} fill="none" stroke="var(--fg-faint)" strokeWidth={0.45} vectorEffect="non-scaling-stroke" />
      {/* Played：MAGMA，用裁剪呈现已播放段 */}
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={`${played * 100}`} height="100" />
        </clipPath>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
        clipPath={`url(#${id})`}
        style={{ filter: 'drop-shadow(0 0 2px var(--accent-glow))' }}
      />
    </svg>
  )
}

export default ProgressLine
