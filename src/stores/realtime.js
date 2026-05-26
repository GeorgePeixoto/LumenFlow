/**
 * LumenFlow — Alpine Store: Realtime (Firebase IoT)
 *
 * Escuta Firebase RTDB e expõe dados IoT reativamente.
 * Uso: Alpine.store('realtime').live.totalPower_W
 */
import { onValue, stopAll } from '../services/firebase.js';

export function registerRealtimeStore(Alpine) {
  Alpine.store('realtime', {
    sectors: [],
    live: {
      totalPower_W: 0,
      totalEnergy_kWh: 0,
      estimativaCusto_R: 0,
      timestamp: null,
    },
    connected: false,
    _unsubscribers: [],

    startListening() {
      if (this.connected) return;

      const unsubSensores = onValue('sensores', (data) => {
        if (!data) return;
        this.sectors = Object.entries(data).map(([key, val]) => ({
          id: key,
          name: val.nome || key,
          potencia: val.potencia || 0,
          energia_kwh: val.energia_kwh || 0,
          corrente: val.corrente || 0,
          tensao: val.tensao || 0,
          fator_pf: val.fator_pf || 0,
        }));
        this.connected = true;
      });

      const unsubLive = onValue('dashboard/readings/live', (data) => {
        if (!data) return;
        this.live = {
          totalPower_W: data.totalPower_W || 0,
          totalEnergy_kWh: data.totalEnergy_kWh || 0,
          estimativaCusto_R: data.estimativaCusto_R || 0,
          timestamp: data.timestamp || null,
        };
        this.connected = true;
      });

      this._unsubscribers = [unsubSensores, unsubLive];
    },

    stopListening() {
      this._unsubscribers.forEach((unsub) => unsub());
      this._unsubscribers = [];
      this.connected = false;
    },

    getSector(id) {
      return this.sectors.find((s) => s.id === id) || null;
    },

    get totalPower() {
      return this.live.totalPower_W;
    },

    get totalEnergy() {
      return this.live.totalEnergy_kWh;
    },
  });
}
