/**
 * 播放器展示模式外壳（artwork / lyrics / compact 三态切换）
 */
import { useState } from 'react'
import { PLAYER_MODES, MODE_LABEL, type PlayerMode } from '@modes'

export function Player(): JSX.Element {
  const [mode, setMode] = useState<PlayerMode>('artwork')

  // 后续由 modes/ 提供各模式的渲染组件，此处先保留切换逻辑骨架
  return (
    <section className="player">
      <nav className="player__mode-switcher" aria-label="展示模式切换">
        {PLAYER_MODES.map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} data-active={mode === m}>
            {MODE_LABEL[m]}
          </button>
        ))}
      </nav>
      <div className="player__viewport" data-mode={mode}>
        {/* 模式内容切换 */}
        <p>当前模式：{MODE_LABEL[mode]}</p>
      </div>
    </section>
  )
}

export default Player
