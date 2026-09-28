/**
 * 主题系统：提供主题类型、场景映射与切换语义层；具体 UI 由 styles/index.css 承载
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { colors } from './tokens'

/** 五档温度主题 */
export type Theme = 'ash' | 'dust' | 'dusk' | 'ember' | 'black'

/** 场景 → 推荐主题（规范 06 节表格） */
export const SCENE_THEMES = {
  library: 'ash',
  album: 'ash',
  fieldNotes: 'dust', // ASH / DUST 取中间档
  journeys: 'dusk', // DUST / DUSK 取中间档
  home: 'dusk',
  nowPlaying: 'ember',
  lateNight: 'black',
  menu: 'ember' // EMBER / BLACK
} as const

export type Scene = keyof typeof SCENE_THEMES

/** 主题的中文/语义描述 */
export const THEME_LABEL: Record<Theme, string> = {
  ash: '白天',
  dust: '黄昏',
  dusk: '夜晚',
  ember: '深度聆听',
  black: '沉浸'
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** 主题提供者：管理当前温度档位 */
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<Theme>('ash')

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** 读取当前主题 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return ctx
}

/**
 * 由主题推导语义色板（供 JS 侧 / 特殊场景使用）。
 * CSS 侧的颜色实际由 .theme-* 类 + CSS 变量承载，此映射用于编程式取色。
 */
export function themeColors(t: Theme): Record<'bg' | 'fg' | 'muted' | 'accent', string> {
  switch (t) {
    case 'ash':
      return { bg: colors.ash, fg: colors.ink, muted: colors.smoke, accent: colors.magma }
    case 'dust':
      return { bg: colors.warmWhite, fg: colors.earth, muted: colors.stone, accent: colors.magma }
    case 'dusk':
      return { bg: colors.earth, fg: colors.warmWhite, muted: colors.stone, accent: colors.warmLight }
    case 'ember':
      return { bg: colors.deepEarth, fg: colors.ash, muted: colors.smoke, accent: colors.magma }
    case 'black':
      return { bg: colors.emberBlack, fg: colors.ash, muted: colors.smoke, accent: colors.fire }
  }
}
