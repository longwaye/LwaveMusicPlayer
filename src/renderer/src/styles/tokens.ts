/**
 * 设计令牌：统一管理颜色、字体、字号、间距与动画参数
 */
export const colors = {
  // ASH 浅色主题（默认）— 依据参考图调整为更暖的大地色系
  ash: '#EAE1CF', // ASH PAPER  旧纸张（暖调）
  warmWhite: '#F7E0D1', // WARM WHITE  暖杏白（贴合参考图）
  ink: '#24221E', // INK
  smoke: '#777168', // SMOKE
  stone: '#9A9286', // STONE
  earth: '#945A3C', // EARTH  暖棕（贴合参考图）

  // EMBER 深色主题
  emberBlack: '#151411', // EMBER BLACK
  night: '#1E1C18', // NIGHT
  deepEarth: '#29231E', // DEEP EARTH

  // 强调色（克制使用）
  magma: '#B85C25', // MAGMA  偏棕橙（贴合参考图）
  fire: '#E0623A', // FIRE  更深橙红（贴合参考图）
  warmLight: '#DDA54F' // WARM LIGHT（贴合参考图）
} as const

export type EmberColor = keyof typeof colors

/** 字体系统 */
export const fonts = {
  display: "'Cormorant Garamond', 'Bodoni Moda', 'DM Serif Display', 'Libre Baskerville', Georgia, serif",
  ui: "'Inter', 'IBM Plex Sans', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif"
} as const

/** 字号阶梯 */
export const fontSizes = {
  displayL: 'clamp(2.5rem, 6vw, 4.5rem)',
  displayM: 'clamp(2rem, 4vw, 3rem)',
  title: 'clamp(1.5rem, 3vw, 2.25rem)',
  chapter: '1.25rem',
  body: '1rem',
  label: '0.8125rem',
  caption: '0.6875rem'
} as const

/** 字距 */
export const letterSpacing = {
  display: '0.02em',
  ui: '0.14em'
} as const

/** 间距尺度 */
export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '2rem',
  lg: '4rem',
  xl: '8rem'
} as const

/** 动画时长（单位：帧 @60fps，按规范 26 节） */
export const motionFrames = {
  ui: 24, // 普通 UI：18–30 帧
  page: 45, // 页面切换：30–60 帧
  film: 60, // Film / Smoke：45–90 帧
  magmaCore: 90 // Magma Core：75–120 帧
} as const

/** 胶片质感参数（规范 22 节，必须非常克制） */
export const filmTexture = {
  grainOpacity: 0.028, // 0.018–0.035
  dustOpacity: 0.012, // 0.005–0.018
  flickerMin: 0.985, // 0.985–1.008
  flickerMax: 1.008,
  vignette: 0.12, // very subtle
  gateWeave: 0.75 // ±0.5–1.0px
} as const

export type MotionFrameKey = keyof typeof motionFrames
