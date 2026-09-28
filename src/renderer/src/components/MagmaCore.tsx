/**
 * MagmaCore — 呼吸播放键
 * 依据规范 13 节：不使用传统 ▶ 播放图标，而是一个"正在呼吸的东西"。
 * Playing：中心 ◉ 轻微呼吸/发光/缩放（周期 2.5–4s，遵循慢而有机）；
 * Paused：停止呼吸，但不变成传统 Pause 图标。
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motionFrames } from '../styles/tokens'

interface MagmaCoreProps {
  playing?: boolean
  size?: number
  onClick?: () => void
}

export function MagmaCore({ playing = false, size = 64, onClick }: MagmaCoreProps): JSX.Element {
  const [on, setOn] = useState(playing)
  const first = useRef(true)

  useEffect(() => {
    setOn(playing)
  }, [playing])

  // 首次挂载不触发切换动画，保持克制
  const animActive = on && !first.current
  if (first.current) {
    first.current = false
  }

  const coreStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `1px solid ${on ? 'var(--accent)' : 'var(--fg-faint)'}`,
    background: on ? 'radial-gradient(circle at 50% 45%, var(--accent-glow), transparent 65%)' : 'transparent',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    transition: 'border-color 1s ease, background 1s ease',
    animation: animActive ? `magma-breathe ${motionFrames.magmaCore / 60}s ease-in-out infinite` : 'none'
  }

  const dotStyle: CSSProperties = {
    width: size * 0.22,
    height: size * 0.22,
    borderRadius: '50%',
    background: on ? 'var(--accent)' : 'var(--fg-faint)',
    transition: 'background 1s ease'
  }

  return (
    <button
      type="button"
      className="magma-core"
      style={coreStyle}
      aria-label={on ? '暂停' : '播放'}
      aria-pressed={on}
      onClick={onClick}
    >
      <span style={dotStyle} />
      <style>{`
        @keyframes magma-breathe {
          0%   { transform: scale(1.000); }
          25%  { transform: scale(1.015); }
          50%  { transform: scale(1.030); }
          75%  { transform: scale(1.012); }
          100% { transform: scale(1.000); }
        }
      `}</style>
    </button>
  )
}

export default MagmaCore
