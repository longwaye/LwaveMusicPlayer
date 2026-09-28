declare module 'NeteaseCloudMusicApi' {
  interface ServeResult {
    server?: import('http').Server
  }
  export function serveNcmApi(options: { port?: number; host?: string }): Promise<ServeResult>
}
