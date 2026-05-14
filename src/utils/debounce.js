/**
 * EnergyFlow — debounce e throttle para controle de frequência de chamadas.
 *
 * Uso:
 *   import { debounce, throttle } from './debounce.js';
 *
 *   // Busca só executa 300ms após o usuário parar de digitar
 *   const search = debounce((term) => fetchResults(term), 300);
 *   input.addEventListener('input', e => search(e.target.value));
 *
 *   // Scroll handler executa no máximo 1x por 100ms
 *   const onScroll = throttle(() => updateHeader(), 100);
 *   window.addEventListener('scroll', onScroll);
 */

/**
 * Retorna uma versão "debounced" da função: só executa após `wait` ms
 * sem novas chamadas. Ideal para inputs de busca e validações ao digitar.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {number} wait  - em milissegundos
 * @returns {(...args: Parameters<T>) => void} função debounced com método .cancel()
 */
export function debounce(fn, wait) {
  let timer = null;

  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  }

  /** Cancela execução pendente sem executar. */
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

/**
 * Retorna uma versão "throttled" da função: executa imediatamente na
 * primeira chamada e depois no máximo 1x a cada `wait` ms.
 * Ideal para handlers de scroll, resize e eventos de alta frequência.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {number} wait  - em milissegundos
 * @returns {(...args: Parameters<T>) => void}
 */
export function throttle(fn, wait) {
  let lastTime = 0;
  let timer = null;

  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}
