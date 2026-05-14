/**
 * EnergyFlow — Hash-based SPA router.
 *
 * Chosen approach: hash routing (#/login, #/dashboard).
 * Rationale: works with any static server (python -m http.server, php -S, etc.)
 * without requiring server-side fallback config. History API would need the
 * server to serve index.html for every path — impractical with a generic static
 * server. Multi-page HTML would reload the full shell on every navigation.
 * Hash routing keeps simplicity while giving SPA-quality UX.
 *
 * API:
 *   Router.register('/path/:id', handler)  — register a route
 *   Router.navigate('/path/123')           — programmatic navigation
 *   Router.start()                         — begin listening (call once on boot)
 *   Router.currentParams()                 — get current route params
 *   Router.currentQuery()                  — get current query string params
 *
 * Params:      /devices/:id          →  handler({ id: '123' })
 * Query string: #/reset-password?token=abc → Router.currentQuery().token === 'abc'
 */

const Router = (() => {
  /** @type {Array<{ regex: RegExp, keys: string[], handler: Function }>} */
  const routes = [];

  /** @type {Function|null} */
  let _notFoundHandler = null;

  /** @type {Object} */
  let _currentParams = {};

  /** @type {Object} */
  let _currentQuery = {};

  /**
   * Convert a route pattern like '/devices/:id' into a RegExp and extract
   * param key names.
   * @param {string} pattern
   * @returns {{ regex: RegExp, keys: string[] }}
   */
  function parsePath(pattern) {
    const keys = [];
    const regexStr = pattern
      .replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return '§§PARAM§§';
      })
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/§§PARAM§§/g, '([^/]+)');
    return { regex: new RegExp(`^${regexStr}$`), keys };
  }

  /**
   * Register a route.
   * @param {string} pattern  - e.g. '/', '/login', '/devices/:id'
   * @param {Function} handler - called with params object
   */
  function register(pattern, handler) {
    const { regex, keys } = parsePath(pattern);
    routes.push({ regex, keys, handler });
  }

  /**
   * Register a fallback handler for unmatched routes (404).
   * @param {Function} handler
   */
  function notFound(handler) {
    _notFoundHandler = handler;
  }

  /**
   * Get the current path from the hash, stripping query string.
   * Falls back to '/' if hash is empty.
   * e.g. '#/reset-password?token=abc' → '/reset-password'
   * @returns {string}
   */
  function getHashPath() {
    const hash = window.location.hash;
    if (!hash) return '/';
    const full = hash.slice(1); // remove leading '#'
    const qIndex = full.indexOf('?');
    return qIndex === -1 ? full : full.slice(0, qIndex);
  }

  /**
   * Parse query string from the current hash.
   * e.g. '#/reset-password?token=abc&foo=bar' → { token: 'abc', foo: 'bar' }
   * @returns {Object}
   */
  function parseHashQuery() {
    const hash = window.location.hash;
    if (!hash) return {};
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return {};
    const qs = hash.slice(qIndex + 1);
    const result = {};
    for (const part of qs.split('&')) {
      const [k, v] = part.split('=');
      if (k) result[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    }
    return result;
  }

  /**
   * Attempt to match path against registered routes and call the handler.
   * Logs a warning if no route matches.
   * @param {string} path
   */
  function dispatch(path) {
    _currentQuery = parseHashQuery();

    for (const route of routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => {
          params[key] = decodeURIComponent(match[i + 1]);
        });
        _currentParams = params;
        route.handler(params);
        return;
      }
    }
    console.warn(`[Router] No route matched: "${path}"`);
    if (_notFoundHandler) _notFoundHandler({ path });
  }

  /**
   * Navigate to a path by updating the hash.
   * @param {string} path - e.g. '/dashboard', '/devices/abc123'
   */
  function navigate(path) {
    window.location.hash = path;
  }

  /**
   * Start the router: listen to hashchange events and dispatch the current hash.
   * Call once after all routes are registered.
   */
  function start() {
    window.addEventListener('hashchange', () => dispatch(getHashPath()));
    dispatch(getHashPath());
  }

  /**
   * Returns path params from the most recently matched route.
   * @returns {Object}
   */
  function currentParams() {
    return { ..._currentParams };
  }

  /**
   * Returns query string params from the current hash URL.
   * e.g. #/reset-password?token=abc → { token: 'abc' }
   * @returns {Object}
   */
  function currentQuery() {
    return { ..._currentQuery };
  }

  return { register, notFound, navigate, start, currentParams, currentQuery };
})();

export default Router;
