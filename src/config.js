/**
 * LumenFlow — Configuracao centralizada.
 *
 * Toda URL, feature flag ou constante de ambiente vem daqui.
 * Componentes e services importam este modulo — nunca hardcodam valores.
 */
const Config = Object.freeze({
  API_BASE_URL: 'http://localhost:8000/api',
  FIREBASE_RTDB_URL: 'https://projeto-pi-bf5a6-default-rtdb.firebaseio.com',
  APP_NAME: 'LumenFlow',
  VERSION: '0.2.0',
  DEFAULT_LOCALE: 'pt-BR',
  POLLING_INTERVAL_MS: 2000,
  TOAST_DURATION_MS: 5000,
  TOKEN_STORAGE_KEY: 'ef_token',
  REMEMBER_STORAGE_KEY: 'ef_remember',
  DEMO_MODE: false,
});

console.log(`[${Config.APP_NAME}] config.js carregado — API: ${Config.API_BASE_URL}`);

export default Config;
