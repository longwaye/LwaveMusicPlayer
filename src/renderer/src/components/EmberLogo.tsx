/**
 * EmberLogo — 文字字标
 * 依据规范 08 节：Cormorant Garamond、极细字重、大字距、充足留白。
 * 高级感来自"文字 + 比例 + 留白"，不做发光/火焰/图形。
 */
import type { CSSProperties } from 'react'

export function EmberLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  const font = size === 'sm' ? 14 : size === 'lg' ? 40 : 24

  const style: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    letterSpacing: '0.35em',
    fontSize: font,
    color: 'var(--fg)',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }

  return (
    <span className="ember-logo display" style={style} aria-label="EMBER">
      E&nbsp;M&nbsp;B&nbsp;E&nbsp;R
    </span>
  )
}

export default EmberLogo
