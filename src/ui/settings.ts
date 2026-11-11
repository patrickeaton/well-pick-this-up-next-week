/** Player preferences. Stored apart from the game save, so a reset keeps them. */
export interface Settings {
  textSize: 'normal' | 'large';
  walkSpeed: 'normal' | 'fast' | 'instant';
  quickRolls: boolean;
  reduceMotion: boolean;
  /** 0–100. */
  musicVolume: number;
  /** 0–100. */
  sfxVolume: number;
  /** Silence everything. */
  muted: boolean;
}

const KEY = 'pick-this-up:settings:v1';

const DEFAULTS: Settings = {
  textSize: 'normal',
  walkSpeed: 'normal',
  quickRolls: false,
  reduceMotion: false,
  musicVolume: 60,
  sfxVolume: 70,
  muted: false,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export const settings: Settings = load();

/** Milliseconds per tile when walking; 0 means jump straight there. */
export const walkStepMs = (): number => ({ normal: 95, fast: 45, instant: 0 })[settings.walkSpeed];

/** Skip the dice tumble (quick rolls, reduced motion, or the system setting). */
export const skipDiceAnimation = (): boolean =>
  settings.quickRolls || settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Reflect settings on the page as classes the CSS can use. */
export function applySettings(): void {
  const root = document.documentElement;
  root.classList.toggle('large-text', settings.textSize === 'large');
  root.classList.toggle('reduce-motion', settings.reduceMotion);
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  settings[key] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked: the setting still applies until reload.
  }
  applySettings();
}
