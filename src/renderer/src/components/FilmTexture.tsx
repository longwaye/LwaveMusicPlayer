/**
 * FilmTexture — 胶片质感层
 * 依据规范 22 节：胶片感必须非常克制，像"真实胶片"而非套滤镜。
 * 提供两层固定覆盖：Vignette（极淡暗角）+ Grain（极淡颗粒漂移）。
 * 数值取自 tokens.filmTexture，禁止 VHS/Glitch/RGB split 等夸张效果。
 */
export function FilmVignette(): JSX.Element {
  return <div className="film-vignette" aria-hidden />
}

export function FilmGrain(): JSX.Element {
  return <div className="film-grain" aria-hidden />
}

/**
 * 组合质感层：在应用根统一挂载一次。
 */
export function FilmTexture(): JSX.Element {
  return (
    <>
      <FilmGrain />
      <FilmVignette />
    </>
  )
}

export default FilmTexture
