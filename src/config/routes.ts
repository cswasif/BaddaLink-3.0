export enum routes {
  ABOUT = '/about',
  DISCLAIMER = '/disclaimer',
  INDEX_HTML = '/index.html',
  PRIVATE_ROOM = '/private/:roomId',
  PUBLIC_ROOM = '/public/:roomId',
  ROOT = '/',
  SETTINGS = '/settings',
  TURN_TEST = '/test-turn',
}

export const homepageUrl = new URL(
  import.meta.env.VITE_HOMEPAGE ?? 'https://chitchatter.im/'
)
