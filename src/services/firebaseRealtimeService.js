/**
 * EnergyFlow — Firebase Realtime Database Service.
 *
 * Acessa o RTDB via REST (sem SDK) para manter o bundle leve.
 * Usado em modo demo para exibir dados reais do Wokwi.
 */

const RTDB_URL = 'https://varejo-inteligente-default-rtdb.firebaseio.com';

export const firebaseRTDB = {
  async get(path) {
    const res = await fetch(`${RTDB_URL}/${path}.json`);
    if (!res.ok) throw new Error(`Firebase GET ${path} failed: ${res.status}`);
    return res.json();
  },
};
