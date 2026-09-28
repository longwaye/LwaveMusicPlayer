import { useApp } from '@renderer/context/AppContext'
import { PageHeader } from '@renderer/components/ui'
export function SettingsPage(): JSX.Element {
  const { toggleTheme, toast, defaultMusicPath } = useApp()
  return (
    <main className="main">
      <div className="container">
        <PageHeader
          kicker="EMBER / SYSTEM"
          title="设置"
          desc="让播放器保持安静。真正重要的是声音，而不是界面。"
        />
        <section className="section settings-list">
          <div className="setting-row">
            <label>LOCAL MUSIC</label>
            <p>本地音乐下载与导入位置</p>
            <span className="setting-value" title={defaultMusicPath}>{defaultMusicPath || '默认音乐目录'}</span>
          </div>
          <div className="setting-row"><label>SOUND QUALITY</label><p>最高可用音质</p><span className="setting-value">LOSSLESS →</span></div>
          <div className="setting-row"><label>PLAYBACK</label><p>歌曲之间保持连续播放</p><span className="setting-value">GAPLESS →</span></div>
          <div className="setting-row">
            <label>APPEARANCE</label>
            <p>温暖纸张与余烬黑色</p>
            <button className="setting-value" onClick={() => { toggleTheme(); toast('EMBER 主题') }}>ASH / EMBER →</button>
          </div>
          <div className="setting-row"><label>GRAIN</label><p>非常轻的 16mm 胶片颗粒</p><span className="setting-value">ON →</span></div>
          <div className="setting-row"><label>MOTION</label><p>页面与播放动画强度</p><span className="setting-value">LOW →</span></div>
          <div className="setting-row"><label>REDUCED MOTION</label><p>降低电影式移动效果</p><span className="setting-value">OFF →</span></div>
        </section>
      </div>
    </main>
  )
}
export default SettingsPage
