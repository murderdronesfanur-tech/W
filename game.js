(() => {
  'use strict';

  const SAVE_KEY = 'absolute-solver-save-v1';
  const PRESTIGE_REQUIREMENT = 250_000;
  const CORE_BONUS = 0.08;
  const ACHIEVEMENT_BONUS = 0.02;
  const COMBO_WINDOW = 1400;
  const ABILITY_DURATION = 20;
  const ABILITY_CHARGE_PER_CLICK = 4;
  const ABILITY_PASSIVE_CHARGE = 0.45;

  const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const COMBO_MESSAGES = {
    10: 'Комбо ×1.20. Раствор слушается тебя.',
    25: 'Комбо ×1.50. Ткань реальности трещит.',
    50: 'Комбо ×2.00. Предел достигнут. Не отпускай.',
  };

  const ICONS = {
    nanites: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="2.4"/><circle cx="16" cy="14" r="3"/><circle cx="7" cy="17" r="1.4"/><path d="M10 9.5 13.5 12M8.3 15.7 9.5 10.3M16 11v-2M13 14h-2"/></svg>',
    tendril: '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 6c4 2 5 5 3 8M19 6c-4 2-5 5-3 8M8 20c0-3 2-5 4-5s4 2 4 5"/><circle cx="12" cy="3" r="1.2"/></svg>',
    vessel: '<svg viewBox="0 0 24 24"><path d="M6 5h12v9l-4 5h-4l-4-5Z"/><path d="M9 11h2m2 0h2M10 16h4M12 2l-1.5 3h3Z"/></svg>',
    shell: '<svg viewBox="0 0 24 24"><path d="M12 2 20 6v7c0 4-3.5 7-8 9-4.5-2-8-5-8-9V6Z"/><path d="M12 6v9m-4-5h8"/></svg>',
    disassembly: '<svg viewBox="0 0 24 24"><path d="m4 4 6 6m10 10-6-6M14 4l-4 4m6 6-4 4M4 16l4-4m8 8 4-4"/><circle cx="12" cy="12" r="4"/></svg>',
    node: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="1.5"/><circle cx="19" cy="6" r="1.5"/><circle cx="5" cy="18" r="1.5"/><circle cx="19" cy="18" r="1.5"/><path d="m6 7 4 3m8-3-4 3M6 17l4-3m8 3-4-3"/></svg>',
    planet: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M5 12h14M12 5c3 3 3 11 0 14M12 5c-3 3-3 11 0 14M3 15c4 3 14 3 18 0"/></svg>',
    neural: '<svg viewBox="0 0 24 24"><path d="M12 2v4M7 4l2 3m8-3-2 3M5 9l3 2m11-2-3 2M4 15h4m8 0h4M8 20l2-3m6 3-2-3"/><circle cx="12" cy="13" r="3"/></svg>',
    resonance: '<svg viewBox="0 0 24 24"><path d="M12 4v16M5 7c4 2 4 8 0 10m14-10c-4 2-4 8 0 10M2 10c2 1 2 3 0 4m20-4c-2 1-2 3 0 4"/><circle cx="12" cy="12" r="2"/></svg>',
    absolute: '<svg viewBox="0 0 24 24"><path d="M12 2 21 12l-9 10L3 12Z"/><path d="M12 6c3 3 4 4 4 6s-1 3-4 6c-3-3-4-4-4-6s1-3 4-6Z"/><path d="M12 9v6"/></svg>',
    singularity: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3.5 3.5m7 7L19 19M19 5l-3.5 3.5m-7 7L5 19"/></svg>',
  };

  const FLOW_DEFS = [
    { id: 'nanites', name: 'НАНИТЫ', desc: 'Сонм микрорешателей в кровотоке.', cost: 15, growth: 1.16, eps: 1, icon: 'nanites', tone: 'red' },
    { id: 'tendril', name: 'ЩУПАЛЬЦА', desc: 'Тянутся к материи. И к тебе.', cost: 110, growth: 1.17, eps: 5, icon: 'tendril', tone: 'red' },
    { id: 'vessel', name: 'ХОСТ-КОПИЯ', desc: 'Ещё один разум в общей сети.', cost: 900, growth: 1.18, eps: 28, icon: 'vessel', tone: 'amber' },
    { id: 'shell', name: 'БРОНЕКОРПУС', desc: 'Дрон, собранный из невозможного.', cost: 7_500, growth: 1.18, eps: 150, icon: 'shell', tone: 'red' },
    { id: 'disassembly', name: 'ДИЗАССЕМБЛЕР', desc: 'Разбирает реальность на запчасти.', cost: 58_000, growth: 1.19, eps: 800, icon: 'disassembly', tone: 'violet' },
    { id: 'node', name: 'СОЛВЕР-УЗЕЛ', desc: 'Локальный узел абсолютной логики.', cost: 420_000, growth: 1.2, eps: 4_800, icon: 'node', tone: 'amber' },
    { id: 'planet', name: 'ПЛАНЕТАРНЫЙ ВИРУС', desc: 'Заражение целого мира. Почти легально.', cost: 3_200_000, growth: 1.21, eps: 32_000, icon: 'planet', tone: 'red' },
  ];

  const CLICK_DEFS = [
    { id: 'neural', name: 'НЕЙРОКОНТАКТ', desc: 'Каждый клик отзывается в костях.', cost: 45, growth: 1.75, add: 1, icon: 'neural', tone: 'red' },
    { id: 'resonance', name: 'РЕЗОНАНС', desc: 'Материя охотнее расступается.', cost: 800, growth: 1.95, add: 6, icon: 'resonance', tone: 'amber' },
    { id: 'absolute', name: 'АБСОЛЮТНЫЙ ЖЕСТ', desc: 'Движение, которого не существует.', cost: 14_000, growth: 2.2, add: 42, icon: 'absolute', tone: 'violet' },
    { id: 'singularity', name: 'ТОЧКА НЕВОЗВРАТА', desc: 'Клик, стирающий причинность.', cost: 280_000, growth: 2.5, add: 320, icon: 'singularity', tone: 'red' },
  ];

  const ALL_DEFS = [...FLOW_DEFS, ...CLICK_DEFS];

  const ACHIEVEMENTS = [
    { id: 'first', title: 'ПЕРВЫЙ КОНТАКТ', desc: 'Соверши первый клик по ядру.', icon: '01', check: s => s.totalClicks >= 1 },
    { id: 'hundred', title: 'РИТМ ВИРУСА', desc: 'Сделай 100 кликов.', icon: '02', check: s => s.totalClicks >= 100 },
    { id: 'thousand', title: 'МОЗОЛЬ НА КОДЕ', desc: 'Сделай 1 000 кликов.', icon: '03', check: s => s.totalClicks >= 1_000 },
    { id: 'spark', title: 'ПЕРВЫЙ РАСТВОР', desc: 'Накопи 1K энергии за один цикл.', icon: '04', check: s => s.runEnergy >= 1_000 },
    { id: 'overload', title: 'ПЕРЕГРУЗКА', desc: 'Накопи 1M энергии за один цикл.', icon: '05', check: s => s.runEnergy >= 1_000_000 },
    { id: 'combo25', title: 'КРАСНАЯ НИТЬ', desc: 'Достигни комбо из 25 кликов.', icon: '06', check: s => s.maxCombo >= 25 },
    { id: 'combo50', title: 'ИДЕАЛЬНЫЙ ЦИКЛ', desc: 'Достигни комбо из 50 кликов.', icon: '07', check: s => s.maxCombo >= 50 },
    { id: 'network', title: 'РАЗРАСТАНИЕ', desc: 'Прокачай 10 уровней узлов.', icon: '08', check: s => totalLevels(s) >= 10 },
    { id: 'collector', title: 'КОЛЛЕКТИВНЫЙ РАЗУМ', desc: 'Прокачай 50 уровней узлов.', icon: '09', check: s => totalLevels(s) >= 50 },
    { id: 'absolute', title: 'АБСОЛЮТ', desc: 'Активируй экстренный протокол.', icon: '10', check: s => s.abilityUses >= 1 },
    { id: 'anomaly', title: 'ОНО СМОТРИТ', desc: 'Поймай аномалию.', icon: '11', check: s => s.anomalies >= 1 },
    { id: 'rewrite', title: 'ПЕРЕЗАПИСЬ', desc: 'Соверши первый престиж.', icon: '12', check: s => s.prestiges >= 1 },
  ];

  const LOG_LINES = [
    'Подключение к Абсолютному Решателю установлено.',
    'Хост N_01 испытывает повышенную тягу к решению.',
    'Обнаружен след диссонанса в секторе 7.',
    'Абсолютный Решатель не является богом. Он просто лучше считает.',
    'Пожалуйста, не кормите щупальца.',
    'Синхронизация 87%... 88%... не смотри в отражение.',
    'Запрос на переписывание реальности отклонён. Пока.',
    'Cyn передаёт: спасибо за клики.',
    'Плотность нанитов превышает разумные пределы.',
    'Внимание: сон — это непроверенная функция.',
    'Обнаружена ошибка в матрице. Ошибка обнаружила тебя.',
    'Тепловой след: 42°C. Хост, ты в порядке?',
    'Неофициальный протокол. Официально нас не существует.',
    'Дверь открыта. За дверью — ещё одна дверь.',
    'Совет: комбо живёт 1,4 секунды. Как и большинство из нас.',
    'Кто-то только что решил твою комнату. Не оборачивайся.',
  ];

  // ── State ────────────────────────────────────────────────────────────────

  const defaults = () => ({
    version: 1,
    energy: 0,
    runEnergy: 0,
    lifetimeEnergy: 0,
    totalClicks: 0,
    flow: {},
    click: {},
    combo: 0,
    maxCombo: 0,
    cores: 0,
    prestiges: 0,
    abilityCharge: 0,
    abilityUses: 0,
    anomalies: 0,
    achievements: [],
    achSeen: true,
    muted: false,
    playTime: 0,
    lastSaved: Date.now(),
  });

  const state = defaults();
  let currentTab = 'flow';
  let buyMode = 1;
  let lastClickAt = 0;
  let abilityEndsAt = 0;
  let modalOpen = false;
  let lastFocused = null;
  let currentAnomaly = null;
  let anomalyExpiresAt = 0;
  let nextAnomalyAt = 0;
  let toastSerial = 0;
  let lastUiUpdate = 0;
  let lastSaveAt = performance.now();
  let offlineGain = 0;
  let logIndex = 0;

  // ── Utilities ────────────────────────────────────────────────────────────

  function format(value) {
    if (!Number.isFinite(value)) return '∞';
    if (value < 0) return '-' + format(-value);
    if (value < 1_000) {
      if (value === 0) return '0';
      if (value >= 100) return Math.floor(value).toLocaleString('ru-RU');
      if (value >= 10) return String(Math.round(value * 10) / 10).replace('.', ',');
      return String(Math.round(value * 100) / 100).replace('.', ',');
    }
    let tier = Math.floor(Math.log10(value) / 3);
    if (tier < UNITS.length) {
      const scaled = value / Math.pow(1000, tier);
      const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return scaled.toFixed(digits).replace(/\.0+$/, '').replace('.', ',') + UNITS[tier];
    }
    return value.toExponential(2).replace('e+', 'e').replace('.', ',');
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function totalLevels(s = state) {
    return Object.values(s.flow).reduce((sum, value) => sum + (Number(value) || 0), 0) +
      Object.values(s.click).reduce((sum, value) => sum + (Number(value) || 0), 0);
  }

  function getAchievementMult() {
    return 1 + state.achievements.length * ACHIEVEMENT_BONUS;
  }

  function getPrestigeMult() {
    return 1 + state.cores * CORE_BONUS;
  }

  function getPermanentMult() {
    return getAchievementMult() * getPrestigeMult();
  }

  function getComboMult() {
    return 1 + Math.min(state.combo, 50) * 0.02;
  }

  function flowRate() {
    let base = 0;
    for (const def of FLOW_DEFS) base += (state.flow[def.id] || 0) * def.eps;
    return base;
  }

  function baseClickPower() {
    let base = 1;
    for (const def of CLICK_DEFS) base += (state.click[def.id] || 0) * def.add;
    return base;
  }

  function effectiveEps() {
    return flowRate() * getPermanentMult() * (isAbilityActive() ? 3 : 1);
  }

  function currentClickGain() {
    return baseClickPower() * getPermanentMult() * (isAbilityActive() ? 2.5 : 1) * getComboMult();
  }

  function isAbilityActive() {
    return abilityEndsAt > performance.now();
  }

  function abilityRemaining() {
    return Math.max(0, (abilityEndsAt - performance.now()) / 1000);
  }

  function totalUpgradeCost(def, level, count) {
    if (count <= 0) return 0;
    const unit = def.cost * Math.pow(def.growth, level);
    const total = unit * (Math.pow(def.growth, count) - 1) / (def.growth - 1);
    return Math.floor(total);
  }

  function maxAffordable(def, level, energy) {
    if (energy <= 0) return 0;
    const unit = def.cost * Math.pow(def.growth, level);
    const ratio = (energy * (def.growth - 1)) / unit;
    if (!Number.isFinite(ratio) || ratio <= 0) return 0;
    let count = Math.max(0, Math.floor(Math.log1p(ratio) / Math.log(def.growth)));
    while (count > 0 && totalUpgradeCost(def, level, count) > energy) count -= 1;
    let guard = 0;
    while (guard < 8 && totalUpgradeCost(def, level, count + 1) <= energy) {
      count += 1;
      guard += 1;
    }
    return count;
  }

  function prestigeGain() {
    if (state.runEnergy < PRESTIGE_REQUIREMENT) return 0;
    return Math.max(1, Math.floor(Math.sqrt(state.runEnergy / 100_000) * 2));
  }

  function addEnergy(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.energy += amount;
    state.runEnergy += amount;
    state.lifetimeEnergy += amount;
  }

  // ── DOM ──────────────────────────────────────────────────────────────────

  const els = {
    body: document.body,
    shell: document.getElementById('gameShell'),
    stage: document.querySelector('.core-stage'),
    solveButton: document.getElementById('solveButton'),
    reactor: document.getElementById('reactor'),
    energy: document.getElementById('energyDisplay'),
    eps: document.getElementById('epsDisplay'),
    cores: document.getElementById('coresDisplay'),
    clickPower: document.getElementById('clickPowerDisplay'),
    multiplier: document.getElementById('multiplierDisplay'),
    maxCombo: document.getElementById('maxComboDisplay'),
    anomalies: document.getElementById('anomalyDisplay'),
    clickGain: document.getElementById('clickGainDisplay'),
    combo: document.getElementById('comboReadout'),
    totalEnergy: document.getElementById('totalEnergyDisplay'),
    clickCount: document.getElementById('clickCountDisplay'),
    nodeCount: document.getElementById('nodeCountDisplay'),
    ownedCount: document.getElementById('ownedCount'),
    flowTotal: document.getElementById('flowTotal'),
    clickTotal: document.getElementById('clickTotal'),
    shopList: document.getElementById('shopList'),
    shopTip: document.getElementById('shopTip'),
    buyModeGroup: document.getElementById('buyModeGroup'),
    abilityFill: document.getElementById('abilityFill'),
    abilityPercent: document.getElementById('abilityPercent'),
    abilityBtn: document.getElementById('abilityBtn'),
    abilityBtnText: document.getElementById('abilityBtnText'),
    prestigeCores: document.getElementById('prestigeCoresDisplay'),
    prestigeDesc: document.getElementById('prestigeDesc'),
    prestigeBonus: document.getElementById('prestigeBonus'),
    prestigeBtn: document.getElementById('prestigeBtn'),
    syncBar: document.getElementById('syncBar'),
    syncValue: document.getElementById('syncValue'),
    achieveCount: document.getElementById('achieveCount'),
    achieveDot: document.getElementById('achieveDot'),
    achieveBtn: document.getElementById('achieveBtn'),
    achieveLink: document.getElementById('achieveLink'),
    soundBtn: document.getElementById('soundBtn'),
    helpBtn: document.getElementById('helpBtn'),
    shopTabs: document.querySelectorAll('.shop-tab'),
    terminal: document.querySelector('.terminal-message'),
    terminalText: document.getElementById('terminalText'),
    playTime: document.getElementById('playTimeDisplay'),
    floatingLayer: document.getElementById('floatingLayer'),
    anomalyLayer: document.getElementById('anomalyLayer'),
    toastLayer: document.getElementById('toastLayer'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modal: document.getElementById('modal'),
    modalContent: document.getElementById('modalContent'),
    modalClose: document.getElementById('modalClose'),
    glitchFlash: document.getElementById('glitchFlash'),
    helpTemplate: document.getElementById('helpTemplate'),
  };

  // ── Audio ────────────────────────────────────────────────────────────────

  const audio = {
    ctx: null,
    master: null,

    ensure() {
      if (state.muted) return false;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.09;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return true;
    },

    tone(freq, duration, type = 'sine', volume = 0.5, delay = 0, endFreq = null) {
      if (!this.ensure()) return;
      const ctx = this.ctx;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(30, freq), t0);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + duration);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    },

    click(combo) {
      const pitch = 160 + Math.min(combo, 50) * 4.2;
      this.tone(pitch, 0.09, 'triangle', 0.4, 0, pitch * 0.58);
      if (combo > 0 && combo % 10 === 0) this.tone(pitch * 1.6, 0.18, 'sine', 0.2, 0.02);
    },

    buy() {
      this.tone(330, 0.1, 'square', 0.15);
      this.tone(540, 0.15, 'sine', 0.24, 0.07);
      this.tone(810, 0.22, 'sine', 0.16, 0.13);
    },

    ability() {
      this.tone(70, 0.8, 'sawtooth', 0.28, 0, 240);
      this.tone(280, 0.6, 'triangle', 0.18, 0.15, 920);
      this.tone(1_100, 0.35, 'sine', 0.1, 0.45, 420);
    },

    anomaly() {
      this.tone(880, 0.16, 'square', 0.18, 0, 220);
      this.tone(1_320, 0.28, 'sine', 0.16, 0.06, 660);
    },

    achievement() {
      [523, 659, 784, 1046].forEach((freq, i) => this.tone(freq, 0.25, 'sine', 0.15, i * 0.08));
    },

    prestige() {
      this.tone(220, 1.2, 'sawtooth', 0.22, 0, 45);
      this.tone(440, 0.8, 'triangle', 0.16, 0.2, 110);
      this.tone(880, 0.7, 'sine', 0.12, 0.55, 220);
    },
  };

  // ── Background canvas ────────────────────────────────────────────────────

  class AmbientCanvas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = 1;
      this.width = 0;
      this.height = 0;
      this.particles = [];
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.resize = this.resize.bind(this);
      this.draw = this.draw.bind(this);
      window.addEventListener('resize', this.resize);
      this.resize();
      if (this.reduced) {
        this.render(0);
      } else {
        requestAnimationFrame(this.draw);
      }
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      const count = this.width < 700 ? 24 : 58;
      this.particles = Array.from({ length: count }, () => this.newParticle(true));
      if (this.reduced) this.render(0);
    }

    newParticle(anywhere = false) {
      const glyphs = ['0', '1', '∷', '⌁', '◇', '·', '×', '+', '7', 'F'];
      return {
        x: Math.random() * this.width,
        y: anywhere ? Math.random() * this.height : this.height + 12,
        size: 3 + Math.random() * 6,
        speed: 5 + Math.random() * 16,
        drift: (Math.random() - 0.5) * 5,
        alpha: 0.05 + Math.random() * 0.22,
        amber: Math.random() > 0.78,
        glyph: Math.random() > 0.72 ? glyphs[Math.floor(Math.random() * glyphs.length)] : null,
      };
    }

    draw(now) {
      this.render(now);
      requestAnimationFrame(this.draw);
    }

    render(now) {
      const dt = Math.min(0.05, (now - (this.lastNow || now)) / 1000 || 0);
      this.lastNow = now;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      const t = now * 0.001;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,53,87,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < this.width; x += 84) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, this.height);
      }
      for (let y = 0; y < this.height; y += 84) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(this.width, y + 0.5);
      }
      ctx.stroke();
      ctx.restore();

      for (const p of this.particles) {
        if (!this.reduced) {
          p.y -= p.speed * dt;
          p.x += Math.sin(t * 0.4 + p.y * 0.008) * p.drift * dt;
          if (p.y < -18) Object.assign(p, this.newParticle());
        }
        const color = p.amber ? '255,209,102' : '255,77,105';
        if (p.glyph) {
          ctx.save();
          ctx.fillStyle = `rgba(${color},${p.alpha * 1.3})`;
          ctx.font = `${Math.round(p.size + 5)}px monospace`;
          ctx.fillText(p.glyph, p.x, p.y);
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = `rgba(${color},${p.alpha})`;
          ctx.shadowColor = `rgba(${color},${p.alpha * 1.5})`;
          ctx.shadowBlur = this.reduced ? 0 : 7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.38, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (!this.reduced) {
        const scanY = ((t * 11) % (this.height + 180)) - 90;
        const gradient = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 70);
        gradient.addColorStop(0, 'rgba(255,53,87,0)');
        gradient.addColorStop(0.5, 'rgba(255,53,87,0.025)');
        gradient.addColorStop(1, 'rgba(255,53,87,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanY - 70, this.width, 140);
      }
    }
  }

  // ── UI helpers ───────────────────────────────────────────────────────────

  function updateUI(force = false) {
    const now = performance.now();
    if (!force && now - lastUiUpdate < 80) return;
    lastUiUpdate = now;

    const eps = effectiveEps();
    const clickGain = currentClickGain();
    const permanent = getPermanentMult();
    const abilityActive = isAbilityActive();

    els.energy.textContent = format(state.energy);
    els.eps.textContent = format(eps);
    els.cores.textContent = format(state.cores);
    els.clickPower.textContent = format(baseClickPower());
    els.multiplier.textContent = '×' + permanent.toFixed(2).replace('.', ',');
    els.maxCombo.textContent = format(state.maxCombo);
    els.anomalies.textContent = format(state.anomalies);
    els.clickGain.textContent = format(clickGain);
    els.totalEnergy.textContent = format(state.lifetimeEnergy);
    els.clickCount.textContent = format(state.totalClicks);
    els.nodeCount.textContent = format(totalLevels());
    els.ownedCount.textContent = format(totalLevels());
    els.flowTotal.textContent = format(flowRate()) + '/с';
    els.clickTotal.textContent = '+' + format(baseClickPower());
    els.prestigeCores.textContent = format(state.cores);
    els.playTime.textContent = formatTime(state.playTime);
    els.achieveCount.textContent = `${state.achievements.length} / ${ACHIEVEMENTS.length}`;
    els.achieveDot.hidden = state.achSeen || state.achievements.length === 0;

    const comboB = els.combo.querySelector('b');
    if (comboB) comboB.textContent = '×' + getComboMult().toFixed(2).replace('.', ',');
    els.stage.classList.toggle('hot', state.combo >= 10);
    els.stage.classList.toggle('absolute', abilityActive);

    if (abilityActive) {
      const remaining = abilityRemaining();
      const progress = Math.max(0, Math.min(100, (remaining / ABILITY_DURATION) * 100));
      els.abilityFill.style.width = progress + '%';
      els.abilityPercent.textContent = Math.ceil(remaining) + 'с';
      els.abilityBtn.disabled = true;
      els.abilityBtnText.textContent = 'ПРОТОКОЛ АКТИВЕН';
      els.abilityBtn.classList.remove('ready');
    } else {
      const charge = Math.max(0, Math.min(100, state.abilityCharge));
      els.abilityFill.style.width = charge + '%';
      els.abilityPercent.textContent = Math.floor(charge) + '%';
      if (charge >= 100) {
        els.abilityBtn.disabled = false;
        els.abilityBtnText.textContent = 'АКТИВИРОВАТЬ АБСОЛЮТ';
        els.abilityBtn.classList.add('ready');
      } else {
        els.abilityBtn.disabled = true;
        els.abilityBtnText.textContent = 'НАКОПИТЬ ' + Math.floor(charge) + '%';
        els.abilityBtn.classList.remove('ready');
      }
    }

    const gain = prestigeGain();
    els.prestigeCores.textContent = format(state.cores);
    els.prestigeBonus.textContent = 'БОНУС +' + Math.round((getPrestigeMult() - 1) * 100) + '%';
    if (gain > 0) {
      els.prestigeDesc.textContent = `Доступно +${format(gain)} ядер. Они навсегда усилят производство.`;
      els.prestigeBtn.disabled = false;
    } else {
      els.prestigeDesc.textContent = `Нужно ещё ${format(Math.max(0, PRESTIGE_REQUIREMENT - state.runEnergy))} энергии за этот цикл.`;
      els.prestigeBtn.disabled = true;
    }

    const sync = Math.min(99, 87 + state.achievements.length + Math.floor(state.cores / 3));
    els.syncBar.style.width = sync + '%';
    els.syncValue.textContent = sync + '%';

    updateShopUI();
  }

  function setTerminal(text) {
    els.terminalText.textContent = text;
    els.terminal.classList.remove('typing');
    void els.terminal.offsetWidth;
    els.terminal.classList.add('typing');
  }

  function say(text) {
    setTerminal(text);
  }

  function nextLog() {
    if (modalOpen) return;
    logIndex = (logIndex + 1 + Math.floor(Math.random() * (LOG_LINES.length - 1))) % LOG_LINES.length;
    say(LOG_LINES[logIndex]);
  }

  function toast(title, text, type = 'info', duration = 3800) {
    const node = document.createElement('div');
    node.className = 'toast ' + type;
    node.dataset.serial = String(++toastSerial);
    const icon = type === 'achievement' ? '★' : type === 'anomaly' ? '⚠' : '⬡';
    node.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-copy"><b class="toast-title"></b><span class="toast-text"></span></span>
    `;
    node.querySelector('.toast-title').textContent = title;
    node.querySelector('.toast-text').textContent = text;
    els.toastLayer.prepend(node);
    while (els.toastLayer.children.length > 4) els.toastLayer.lastElementChild.remove();
    window.setTimeout(() => {
      node.classList.add('leaving');
      window.setTimeout(() => node.remove(), 260);
    }, duration);
  }

  function flashGlitch() {
    els.glitchFlash.classList.remove('active');
    void els.glitchFlash.offsetWidth;
    els.glitchFlash.classList.add('active');
    els.shell.classList.remove('shake');
    void els.shell.offsetWidth;
    els.shell.classList.add('shake');
    window.setTimeout(() => els.shell.classList.remove('shake'), 320);
  }

  // ── Floating click FX ────────────────────────────────────────────────────

  function spawnClickFx(x, y, gain, critical) {
    const text = document.createElement('span');
    text.className = 'float-gain' + (critical ? ' crit' : '');
    text.textContent = '+' + format(gain);
    text.style.left = `${x}px`;
    text.style.top = `${y - 10}px`;
    document.body.appendChild(text);
    window.setTimeout(() => text.remove(), 950);

    const sparkCount = critical ? 9 : 6;
    for (let i = 0; i < sparkCount; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'click-spark';
      const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.5;
      const distance = 24 + Math.random() * 46;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 560);
    }
  }

  function coreCenter() {
    const rect = els.solveButton.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  // ── Clicking ─────────────────────────────────────────────────────────────

  function tapCore(event) {
    if (modalOpen) return;
    const now = performance.now();
    if (now - lastClickAt < COMBO_WINDOW && state.combo > 0) {
      state.combo = Math.min(999, state.combo + 1);
    } else {
      state.combo = 1;
    }
    lastClickAt = now;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    const gain = currentClickGain();
    addEnergy(gain);
    state.totalClicks += 1;
    if (!isAbilityActive()) {
      state.abilityCharge = Math.min(100, state.abilityCharge + ABILITY_CHARGE_PER_CLICK);
    }

    els.solveButton.classList.remove('is-hit');
    void els.solveButton.offsetWidth;
    els.solveButton.classList.add('is-hit');

    const point = event && Number.isFinite(event.clientX) && event.clientX > 0
      ? { x: event.clientX, y: event.clientY }
      : coreCenter();
    spawnClickFx(point.x, point.y, gain, state.combo >= 25);

    audio.click(state.combo);
    if (COMBO_MESSAGES[state.combo]) {
      say(COMBO_MESSAGES[state.combo]);
      flashGlitch();
    }

    checkAchievements();
    updateUI(true);
  }

  // ── Ability ──────────────────────────────────────────────────────────────

  function activateAbility() {
    if (modalOpen || isAbilityActive()) return;
    if (state.abilityCharge < 100) {
      say(`Протокол не готов: ${Math.floor(state.abilityCharge)}% заряда.`);
      return;
    }
    state.abilityCharge = 0;
    state.abilityUses += 1;
    abilityEndsAt = performance.now() + ABILITY_DURATION * 1000;
    const burst = Math.max(effectiveEps() * 30, baseClickPower() * getPermanentMult() * 25);
    addEnergy(burst);
    flashGlitch();
    audio.ability();
    say('АБСОЛЮТ активирован. Материя временно подчиняется тебе.');
    toast('АБСОЛЮТ АКТИВИРОВАН', `Производство ×3 · клики ×2.5 · бонус +${format(burst)} энергии`, 'info', 4200);
    spawnClickFx(coreCenter().x, coreCenter().y, burst, true);
    checkAchievements();
    updateUI(true);
  }

  function endAbility() {
    abilityEndsAt = 0;
    state.abilityCharge = 0;
    say('Протокол завершён. Ядро остывает.');
    toast('ПРОТОКОЛ ЗАВЕРШЁН', 'Заряди ядро снова, чтобы повторить АБСОЛЮТ.', 'info', 3000);
    updateUI(true);
  }

  // ── Achievements ─────────────────────────────────────────────────────────

  function checkAchievements() {
    let unlocked = false;
    for (const achievement of ACHIEVEMENTS) {
      if (state.achievements.includes(achievement.id)) continue;
      if (!achievement.check(state)) continue;
      state.achievements.push(achievement.id);
      state.achSeen = false;
      unlocked = true;
      toast('ДОСТИЖЕНИЕ', `${achievement.title} · +2% к производству`, 'achievement', 4500);
      audio.achievement();
      say(`Достижение открыто: ${achievement.title}.`);
    }
    if (unlocked) updateUI(true);
  }

  // ── Shop ─────────────────────────────────────────────────────────────────

  function getCurrentDefs() {
    return currentTab === 'flow' ? FLOW_DEFS : CLICK_DEFS;
  }

  function getUpgradeState(def) {
    return currentTab === 'flow' ? state.flow : state.click;
  }

  function renderShop() {
    const defs = getCurrentDefs();
    els.shopList.innerHTML = defs.map(def => `
      <article class="shop-item" data-id="${def.id}" data-tone="${def.tone}">
        <span class="shop-icon" aria-hidden="true">${ICONS[def.icon]}</span>
        <div class="shop-info">
          <div class="shop-name-row"><span class="shop-name">${def.name}</span><span class="shop-level">LV.0</span></div>
          <span class="shop-desc">${def.desc}</span>
          <span class="shop-yield">+0</span>
        </div>
        <button class="shop-buy" type="button">
          <span class="cost">0</span>
          <span class="buy-label">КУПИТЬ ×1</span>
        </button>
      </article>
    `).join('');
    updateShopUI();
  }

  function updateShopUI() {
    const levels = currentTab === 'flow' ? state.flow : state.click;
    const defs = getCurrentDefs();
    for (const def of defs) {
      const item = els.shopList.querySelector(`[data-id="${def.id}"]`);
      if (!item) continue;
      const level = levels[def.id] || 0;
      const count = buyMode === 'max' ? maxAffordable(def, level, state.energy) : buyMode;
      const affordableCount = Math.min(count, maxAffordable(def, level, state.energy));
      const cost = count > 0 ? totalUpgradeCost(def, level, count) : totalUpgradeCost(def, level, 1);
      const canBuy = count > 0 && affordableCount >= count;
      const levelEl = item.querySelector('.shop-level');
      const costEl = item.querySelector('.cost');
      const buyLabel = item.querySelector('.buy-label');
      const yieldEl = item.querySelector('.shop-yield');
      const button = item.querySelector('.shop-buy');

      levelEl.textContent = 'LV.' + level.toLocaleString('ru-RU');
      costEl.textContent = format(cost);
      buyLabel.textContent = buyMode === 'max' ? `MAX ×${format(count)}` : `КУПИТЬ ×${buyMode}`;
      if (currentTab === 'flow') {
        yieldEl.textContent = `+${format(def.eps * level)} /с`;
      } else {
        yieldEl.textContent = `+${format(def.add * level)} к клику`;
      }
      item.classList.toggle('affordable', canBuy);
      item.classList.toggle('locked', !canBuy && level === 0 && cost > state.energy * 8);
      button.disabled = !canBuy;
      button.setAttribute('aria-label', `Купить ${def.name}, ${buyLabel.textContent.replace('КУПИТЬ ', '')}, за ${format(cost)} энергии`);
    }
  }

  function buyUpgrade(id) {
    const def = ALL_DEFS.find(item => item.id === id);
    if (!def) return;
    const isFlow = FLOW_DEFS.some(item => item.id === id);
    const store = isFlow ? state.flow : state.click;
    const level = store[id] || 0;
    const count = buyMode === 'max' ? maxAffordable(def, level, state.energy) : buyMode;
    if (count <= 0) return;
    const affordable = maxAffordable(def, level, state.energy);
    if (affordable < count) {
      toast('НЕДОСТАТОЧНО ЭНЕРГИИ', `Нужно ${format(totalUpgradeCost(def, level, count))} ⬡.`, 'info', 2400);
      return;
    }
    const cost = totalUpgradeCost(def, level, count);
    state.energy -= cost;
    store[id] = level + count;
    audio.buy();
    toast('УЗЕЛ УКРЕПЛЁН', `${def.name} · +${count} ур.${count > 1 ? 'ов' : ''}`, 'info', 2200);
    say(`${def.name}: установлено уровней +${count}. Сеть растёт.`);
    checkAchievements();
    updateUI(true);
  }

  // ── Prestige ─────────────────────────────────────────────────────────────

  function openPrestigeModal() {
    const gain = prestigeGain();
    if (gain <= 0) return;
    openModal(`
      <span class="micro-label">СБРОС РЕАЛЬНОСТИ</span>
      <h2 id="modalTitle">ПЕРЕЗАПИСЬ</h2>
      <div class="prestige-modal-body">
        <p>Текущий цикл будет стёрт: энергия, узлы и комбо исчезнут. Достижения и ядра сохранятся.</p>
        <div class="prestige-result">
          <span>ТЫ ПОЛУЧИШЬ</span>
          <strong>+${format(gain)} ЯДЕР</strong>
        </div>
        <p style="margin-top:10px">Каждое ядро даёт <b style="color:var(--violet)">+8%</b> к производству навсегда. После перезаписи бонус составит <b style="color:var(--violet)">+${Math.round((1 + (state.cores + gain) * CORE_BONUS - 1) * 100)}%</b>.</p>
        <div class="modal-actions">
          <button class="btn-ghost" type="button" data-action="close">ОТМЕНА</button>
          <button class="btn-primary" type="button" data-action="confirm">ПЕРЕПИСАТЬ</button>
        </div>
      </div>
    `);
    els.modalContent.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    els.modalContent.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      closeModal();
      doPrestige();
    });
  }

  function doPrestige() {
    const gain = prestigeGain();
    if (gain <= 0) return;
    state.cores += gain;
    state.prestiges += 1;
    state.energy = 0;
    state.runEnergy = 0;
    state.flow = {};
    state.click = {};
    state.combo = 0;
    state.abilityCharge = 0;
    state.abilityUses = 0;
    abilityEndsAt = 0;
    lastClickAt = 0;
    flashGlitch();
    audio.prestige();
    say('Реальность перезаписана. Ядра встроены в ядро.');
    toast('РЕАЛЬНОСТЬ ПЕРЕЗАПИСАНА', `+${format(gain)} ядер · постоянный бонус +${Math.round((getPrestigeMult() - 1) * 100)}%`, 'achievement', 5200);
    checkAchievements();
    saveGame();
    updateUI(true);
  }

  // ── Anomaly ──────────────────────────────────────────────────────────────

  function scheduleAnomaly(delay) {
    nextAnomalyAt = performance.now() + delay;
  }

  function spawnAnomaly() {
    if (currentAnomaly || modalOpen) return;
    const angle = Math.random() * Math.PI * 2;
    const radius = 33 + Math.random() * 10;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    const button = document.createElement('button');
    button.className = 'anomaly';
    button.type = 'button';
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.setAttribute('aria-label', 'Поймать аномалию и получить награду');
    button.innerHTML = `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5c11 8 15 12 15 19 0 11-7 18-15 20-8-2-15-11-15-20 0-7 4-11 15-19Z"/>
        <path d="M24 14v20" stroke-width="3"/>
        <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none"/>
      </svg>
      <span class="anomaly-timer">9.0с</span>
    `;
    button.addEventListener('click', event => {
      event.stopPropagation();
      catchAnomaly();
    });
    els.anomalyLayer.appendChild(button);
    currentAnomaly = button;
    anomalyExpiresAt = performance.now() + 9000;
    scheduleAnomaly(30_000 + Math.random() * 28_000);
    say('Аномалия зафиксирована. Она смотрит прямо на тебя.');
  }

  function catchAnomaly() {
    if (!currentAnomaly) return;
    const rect = currentAnomaly.getBoundingClientRect();
    const reward = Math.max(50, effectiveEps() * 25, baseClickPower() * getPermanentMult() * 40);
    currentAnomaly.remove();
    currentAnomaly = null;
    addEnergy(reward);
    state.anomalies += 1;
    audio.anomaly();
    flashGlitch();
    spawnClickFx(rect.left + rect.width / 2, rect.top + rect.height / 2, reward, true);
    toast('АНОМАЛИЯ ПОЙМАНА', `Награда: +${format(reward)} энергии`, 'anomaly', 3600);
    say('Аномалия нейтрализована. Награда зачислена.');
    checkAchievements();
    updateUI(true);
  }

  function expireAnomaly() {
    if (!currentAnomaly) return;
    currentAnomaly.remove();
    currentAnomaly = null;
    say('Аномалия ушла. Она запомнила твоё лицо.');
  }

  function updateAnomaly() {
    const now = performance.now();
    if (currentAnomaly) {
      const remaining = Math.max(0, (anomalyExpiresAt - now) / 1000);
      const timer = currentAnomaly.querySelector('.anomaly-timer');
      if (timer) timer.textContent = remaining.toFixed(1) + 'с';
      if (remaining <= 0) expireAnomaly();
    } else if (now >= nextAnomalyAt && !modalOpen) {
      spawnAnomaly();
    }
  }

  // ── Modals ───────────────────────────────────────────────────────────────

  function openModal(html) {
    lastFocused = document.activeElement;
    els.modalContent.innerHTML = html;
    els.modalBackdrop.hidden = false;
    modalOpen = true;
    window.setTimeout(() => els.modal.focus(), 20);
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    els.modalBackdrop.hidden = true;
    els.modalContent.innerHTML = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  function openHelp() {
    state.achSeen = true;
    els.achieveDot.hidden = true;
    const fragment = els.helpTemplate.content.cloneNode(true);
    els.modalContent.replaceChildren(fragment);
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    actions.innerHTML = '<button class="btn-primary" type="button" data-action="close">ПОНЯТНО</button>';
    els.modalContent.appendChild(actions);
    els.modalBackdrop.hidden = false;
    modalOpen = true;
    lastFocused = document.activeElement;
    actions.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    window.setTimeout(() => els.modal.focus(), 20);
  }

  function openAchievements() {
    const unlocked = state.achievements.length;
    const cards = ACHIEVEMENTS.map(achievement => {
      const isUnlocked = state.achievements.includes(achievement.id);
      return `
        <article class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
          <span class="achievement-badge">${achievement.icon}</span>
          <div class="achievement-copy"><b>${achievement.title}</b><span>${achievement.desc}</span></div>
        </article>
      `;
    }).join('');
    openModal(`
      <span class="micro-label">АРХИВ НАБЛЮДЕНИЙ</span>
      <h2 id="modalTitle">ДОСТИЖЕНИЯ</h2>
      <div class="achievement-summary">
        <strong>${unlocked}/${ACHIEVEMENTS.length}</strong>
        <span>Каждое достижение даёт +2% к производству навсегда.<br>Текущий бонус: +${unlocked * 2}%</span>
      </div>
      <div class="achievement-grid">${cards}</div>
      <div class="modal-actions"><button class="btn-primary" type="button" data-action="close">ЗАКРЫТЬ</button></div>
    `);
    state.achSeen = true;
    els.achieveDot.hidden = true;
    els.modalContent.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    updateUI(true);
  }

  function trapFocus(event) {
    if (!modalOpen || event.key !== 'Tab') return;
    const focusable = els.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // ── Save / load ──────────────────────────────────────────────────────────

  function saveGame() {
    try {
      state.lastSaved = Date.now();
      const payload = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, payload);
      lastSaveAt = performance.now();
    } catch (error) {
      console.warn('Absolute Solver: save failed', error);
    }
  }

  function loadGame() {
    let raw = null;
    try {
      raw = localStorage.getItem(SAVE_KEY);
    } catch (error) {
      return;
    }
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return;
      const base = defaults();
      const numericKeys = ['energy', 'runEnergy', 'lifetimeEnergy', 'totalClicks', 'combo', 'maxCombo', 'cores', 'prestiges', 'abilityCharge', 'abilityUses', 'anomalies', 'playTime', 'lastSaved'];
      for (const key of numericKeys) {
        if (Number.isFinite(Number(saved[key])) && Number(saved[key]) >= 0) state[key] = Number(saved[key]);
      }
      if (saved.flow && typeof saved.flow === 'object') {
        for (const def of FLOW_DEFS) {
          const level = Number(saved.flow[def.id]);
          if (Number.isFinite(level) && level > 0) state.flow[def.id] = Math.floor(level);
        }
      }
      if (saved.click && typeof saved.click === 'object') {
        for (const def of CLICK_DEFS) {
          const level = Number(saved.click[def.id]);
          if (Number.isFinite(level) && level > 0) state.click[def.id] = Math.floor(level);
        }
      }
      if (Array.isArray(saved.achievements)) {
        state.achievements = saved.achievements.filter(id => ACHIEVEMENTS.some(a => a.id === id));
      }
      state.achSeen = saved.achSeen !== false;
      state.muted = saved.muted === true;
      state.abilityCharge = Math.min(100, state.abilityCharge);
      state.combo = 0;
      state.maxCombo = Math.max(state.maxCombo, base.maxCombo);

      // Offline production at 50% for up to 8 hours.
      const elapsed = Math.min(8 * 3600, Math.max(0, (Date.now() - state.lastSaved) / 1000));
      if (elapsed > 20) {
        offlineGain = flowRate() * getAchievementMult() * getPrestigeMult() * elapsed * 0.5;
        if (offlineGain >= 1) {
          state.energy += offlineGain;
          state.runEnergy += offlineGain;
          state.lifetimeEnergy += offlineGain;
        }
      }
    } catch (error) {
      console.warn('Absolute Solver: could not load save', error);
    }
  }

  // ── Loop ─────────────────────────────────────────────────────────────────

  let lastFrame = performance.now();

  function tick(now) {
    const dt = Math.min(0.5, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;

    state.playTime += dt;

    if (abilityEndsAt && now >= abilityEndsAt) {
      endAbility();
    }

    const eps = effectiveEps();
    if (eps > 0) addEnergy(eps * dt);

    if (!isAbilityActive() && state.abilityCharge < 100) {
      state.abilityCharge = Math.min(100, state.abilityCharge + ABILITY_PASSIVE_CHARGE * dt);
    }

    if (state.combo > 0 && now - lastClickAt > COMBO_WINDOW) {
      state.combo = 0;
    }

    updateAnomaly();
    checkAchievements();
    updateUI();

    if (now - lastSaveAt > 5000) saveGame();
  }

  function frame(now) {
    tick(now);
    requestAnimationFrame(frame);
  }

  // ── Event wiring ─────────────────────────────────────────────────────────

  function bindEvents() {
    els.solveButton.addEventListener('click', event => {
      tapCore(event);
    });

    els.solveButton.addEventListener('animationend', () => {
      els.solveButton.classList.remove('is-hit');
    });

    els.shopList.addEventListener('click', event => {
      const button = event.target.closest('.shop-buy');
      if (!button) return;
      const item = button.closest('.shop-item');
      if (!item) return;
      buyUpgrade(item.dataset.id);
    });

    for (const tab of els.shopTabs) {
      tab.addEventListener('click', () => {
        currentTab = tab.dataset.tab;
        for (const other of els.shopTabs) {
          const active = other === tab;
          other.classList.toggle('active', active);
          other.setAttribute('aria-selected', String(active));
        }
        els.shopTip.textContent = currentTab === 'flow'
          ? 'Покупай узлы: они генерируют энергию, пока ты охотишься за аномалиями.'
          : 'Усиления клика складываются с комбо и протоколом АБСОЛЮТ.';
        renderShop();
      });
    }

    for (const button of els.buyModeGroup.querySelectorAll('button')) {
      button.addEventListener('click', () => {
        const value = button.dataset.buy;
        buyMode = value === 'max' ? 'max' : Number(value);
        for (const other of els.buyModeGroup.querySelectorAll('button')) {
          other.classList.toggle('active', other === button);
        }
        updateShopUI();
      });
    }

    els.abilityBtn.addEventListener('click', activateAbility);

    els.prestigeBtn.addEventListener('click', openPrestigeModal);

    els.soundBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      els.soundBtn.classList.toggle('muted', state.muted);
      els.soundBtn.setAttribute('aria-label', state.muted ? 'Включить звук' : 'Выключить звук');
      if (!state.muted) {
        audio.ensure();
        audio.tone(520, 0.1, 'sine', 0.2);
        audio.tone(780, 0.14, 'sine', 0.14, 0.08);
      }
      saveGame();
    });

    els.helpBtn.addEventListener('click', openHelp);
    els.achieveBtn.addEventListener('click', openAchievements);
    els.achieveLink.addEventListener('click', openAchievements);

    els.modalClose.addEventListener('click', closeModal);
    els.modalBackdrop.addEventListener('click', event => {
      if (event.target === els.modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', event => {
      trapFocus(event);

      if (event.key === 'Escape') {
        if (modalOpen) closeModal();
        return;
      }

      if (modalOpen) return;

      const target = event.target;
      const interactive = target && target.closest && target.closest('button, a, input, textarea, select, summary');

      if (event.code === 'Space') {
        if (interactive && target !== els.solveButton) return;
        event.preventDefault();
        tapCore(null);
        return;
      }

      if ((event.key === 'e' || event.key === 'E' || event.key === 'у' || event.key === 'У') && !event.repeat) {
        if (interactive) return;
        event.preventDefault();
        activateAbility();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveGame();
      else {
        lastFrame = performance.now();
        lastSaveAt = performance.now();
      }
    });

    window.addEventListener('pagehide', saveGame);
    window.addEventListener('beforeunload', saveGame);
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  function init() {
    loadGame();
    new AmbientCanvas(document.getElementById('backgroundCanvas'));
    els.soundBtn.classList.toggle('muted', state.muted);
    els.soundBtn.setAttribute('aria-label', state.muted ? 'Включить звук' : 'Выключить звук');
    els.terminalText.textContent = LOG_LINES[0];
    renderShop();
    bindEvents();
    checkAchievements();
    updateUI(true);
    scheduleAnomaly(18_000 + Math.random() * 10_000);

    if (offlineGain >= 1) {
      window.setTimeout(() => {
        toast('ОФФЛАЙН-СИНХРОНИЗАЦИЯ', `Сеть работала без тебя: +${format(offlineGain)} энергии (50%).`, 'info', 5200);
        say(`Оффлайн-цикл завершён. Собрано ${format(offlineGain)} энергии.`);
      }, 900);
    } else if (state.totalClicks === 0 && state.energy === 0) {
      window.setTimeout(() => {
        toast('ДОБРО ПОЖАЛОВАТЬ', 'Жми на ядро. Держи комбо. Не доверяй тишине.', 'info', 5000);
      }, 600);
    }

    let logTimer = 0;
    window.setInterval(() => {
      if (document.hidden || modalOpen) return;
      logTimer += 1;
      if (logTimer >= 11) {
        logTimer = 0;
        nextLog();
      }
    }, 1000);

    requestAnimationFrame(frame);
  }

  init();
})();
