/**
 * LumenFlow — Period Picker (Alpine component)
 *
 * Seletor de período com presets e datas customizadas.
 * Uso:
 *   <div x-data="periodPicker({ onChange: (period) => loadChart(period) })">
 *     <select x-model="preset" @change="applyPreset">
 *       <template x-for="p in presets" :key="p.value">
 *         <option :value="p.value" x-text="p.label"></option>
 *       </template>
 *     </select>
 *     <input type="date" x-model="from" @change="applyCustom" />
 *     <input type="date" x-model="to" @change="applyCustom" />
 *   </div>
 */

export function registerPeriodPicker(Alpine) {
  Alpine.data('periodPicker', (config = {}) => ({
    preset: config.defaultPreset || 'last7',
    from: '',
    to: '',
    granularity: config.defaultGranularity || 'day',
    onChange: config.onChange || null,

    presets: [
      { value: 'today', label: 'Hoje', granularity: 'hour' },
      { value: 'last7', label: 'Últimos 7 dias', granularity: 'day' },
      { value: 'last30', label: 'Últimos 30 dias', granularity: 'day' },
      { value: 'currentMonth', label: 'Mês atual', granularity: 'day' },
      { value: 'previousMonth', label: 'Mês anterior', granularity: 'day' },
      { value: 'custom', label: 'Personalizado', granularity: 'day' },
    ],

    init() {
      this.applyPreset();
    },

    applyPreset() {
      const now = new Date();
      const presetConfig = this.presets.find((p) => p.value === this.preset);
      this.granularity = presetConfig?.granularity || 'day';

      switch (this.preset) {
        case 'today':
          this.from = this._toISO(now);
          this.to = this._toISO(now);
          break;
        case 'last7':
          this.from = this._toISO(this._addDays(now, -6));
          this.to = this._toISO(now);
          break;
        case 'last30':
          this.from = this._toISO(this._addDays(now, -29));
          this.to = this._toISO(now);
          break;
        case 'currentMonth':
          this.from = this._toISO(new Date(now.getFullYear(), now.getMonth(), 1));
          this.to = this._toISO(now);
          break;
        case 'previousMonth':
          this.from = this._toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1));
          this.to = this._toISO(new Date(now.getFullYear(), now.getMonth(), 0));
          break;
        case 'custom':
          return;
      }

      this._emit();
    },

    applyCustom() {
      if (this.from && this.to) {
        this.preset = 'custom';
        this._emit();
      }
    },

    _emit() {
      if (this.onChange) {
        this.onChange({
          from: this.from,
          to: this.to,
          preset: this.preset,
          granularity: this.granularity,
        });
      }
    },

    get isCustom() {
      return this.preset === 'custom';
    },

    get currentLabel() {
      const p = this.presets.find((x) => x.value === this.preset);
      return p?.label || 'Personalizado';
    },

    _toISO(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    _addDays(date, days) {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    },
  }));
}
