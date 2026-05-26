/**
 * LumenFlow — Firebase Realtime Database Service.
 *
 * Acessa o RTDB via REST (sem SDK) para manter o bundle leve.
 */
import Config from '../config.js';

export const firebaseRTDB = {
  async get(path) {
    const res = await fetch(`${Config.FIREBASE_RTDB_URL}/${path}.json`);
    if (!res.ok) throw new Error(`Firebase GET ${path} failed: ${res.status}`);
    return res.json();
  },
};
