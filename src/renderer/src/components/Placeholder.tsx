/**
 * 图片占位 / 真实电影静帧容器
 * - 传入 img 时用真实背景图（cover 填充，对应 /ember/*.jpg）
 * - 未传 img 时回退到 CSS 渐变占位 + label 文字
 */
import type { CSSProperties } from 'react'

export interface PlaceholderProps {
  /** CSS 渐变占位类：'hero' | '1'..'6' */
  ph?: string
  /** 真实背景图 url（优先） */
  img?: string
  /** 渐变占位时显示的文字 */
  label?: string
  className?: string
  style?: CSSProperties
}

export function Placeholder({ ph = '1', img, label, className, style }: PlaceholderProps): JSX.Element {
  const phClass = ph === 'hero' ? 'ph-hero' : `ph-${String(ph).padStart(2, '0')}`
  const mergedStyle: CSSProperties = img
    ? { ...style, backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : (style ?? {})

  return (
    <div className={`placeholder ${phClass}${className ? ` ${className}` : ''}`} style={mergedStyle}>
      {!img && <span>{label}</span>}
    </div>
  )
}
