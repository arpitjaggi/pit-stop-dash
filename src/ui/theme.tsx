import { useState } from 'react';
import { Desktop, Moon, Sun } from './icons';

export type ThemeChoice = 'system' | 'light' | 'dark';
const KEY = 'pitstop:theme';

export function getTheme(): ThemeChoice {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(t: ThemeChoice) {
  try {
    if (t === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {
    /* private mode: the choice lasts until the page closes */
  }
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
}

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Desktop },
];

/** Light, Dark, or follow the device. Applies at once and is remembered. */
export function ThemeToggle({ compact }: { compact?: boolean }) {
  const [choice, setChoice] = useState<ThemeChoice>(getTheme);
  return (
    <div className="seg" role="group" aria-label="Appearance">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={choice === value}
          aria-label={compact ? label : undefined}
          title={label}
          onClick={() => {
            setChoice(value);
            setTheme(value);
          }}
        >
          <Icon size={18} aria-hidden />
          {!compact && label}
        </button>
      ))}
    </div>
  );
}
