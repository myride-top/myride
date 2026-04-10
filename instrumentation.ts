/**
 * Node 25+ can expose global `localStorage` that is unusable when
 * `--localstorage-file` is missing or invalid, which breaks SSR with
 * `localStorage.getItem is not a function` (see nodejs/node#60303).
 * Next runs this once per server process before handling requests.
 * Avoid `process.*` here so Turbopack can bundle this for Edge analysis.
 */
export function register() {
  if (typeof (globalThis as { window?: unknown }).window !== 'undefined') {
    return
  }

  const g = globalThis as typeof globalThis & {
    localStorage?: unknown
    sessionStorage?: unknown
  }

  const isBrokenWebStorage = (storage: unknown): boolean => {
    if (storage == null || typeof storage !== 'object') {
      return false
    }
    return typeof (storage as Storage).getItem !== 'function'
  }

  /** No-op storage: no cross-request persistence during SSR. */
  const ephemeralStorage = (): Storage => ({
    get length() {
      return 0
    },
    clear: () => {},
    getItem: () => null,
    key: () => null,
    removeItem: () => {},
    setItem: () => {},
  })

  const patch = (key: 'localStorage' | 'sessionStorage') => {
    if (!isBrokenWebStorage(g[key])) {
      return
    }
    try {
      Reflect.deleteProperty(g, key)
    } catch {
      /* ignore */
    }
    if (!isBrokenWebStorage(g[key])) {
      return
    }
    try {
      Object.defineProperty(g, key, {
        value: ephemeralStorage(),
        writable: true,
        configurable: true,
        enumerable: true,
      })
    } catch {
      /* ignore */
    }
  }

  patch('localStorage')
  patch('sessionStorage')
}
