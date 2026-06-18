import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ── Types ──────────────────────────────────────────────────────

export type ThemeMode = 'system' | 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';

export interface PaymentMethods {
  cash: boolean;
  card: boolean;
  mobile: boolean;
}

export interface Settings {
  theme: ThemeMode;
  fontSize: FontSize;
  paymentMethods: PaymentMethods;
}

const DEFAULTS: Settings = {
  theme: 'system',
  fontSize: 'medium',
  paymentMethods: { cash: true, card: true, mobile: true },
};

const STORAGE_KEY = 'mpro-pos-settings';

// ── Helpers ────────────────────────────────────────────────────

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, paymentMethods: { ...DEFAULTS.paymentMethods } };
    const parsed = JSON.parse(raw);
    return {
      theme: validateTheme(parsed.theme) ? parsed.theme : DEFAULTS.theme,
      fontSize: validateFontSize(parsed.fontSize) ? parsed.fontSize : DEFAULTS.fontSize,
      paymentMethods: {
        cash: typeof parsed.paymentMethods?.cash === 'boolean' ? parsed.paymentMethods.cash : DEFAULTS.paymentMethods.cash,
        card: typeof parsed.paymentMethods?.card === 'boolean' ? parsed.paymentMethods.card : DEFAULTS.paymentMethods.card,
        mobile: typeof parsed.paymentMethods?.mobile === 'boolean' ? parsed.paymentMethods.mobile : DEFAULTS.paymentMethods.mobile,
      },
    };
  } catch {
    return { ...DEFAULTS, paymentMethods: { ...DEFAULTS.paymentMethods } };
  }
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function validateTheme(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function validateFontSize(value: unknown): value is FontSize {
  return value === 'small' || value === 'medium' || value === 'large';
}

// ── Theme application ──────────────────────────────────────────

function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function applyFontSize(fontSize: FontSize): void {
  const root = document.documentElement;
  root.setAttribute('data-font-size', fontSize);
}

// ── Context ────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: Settings;
  updateTheme: (theme: ThemeMode) => void;
  updateFontSize: (fontSize: FontSize) => void;
  updatePaymentMethods: (methods: PaymentMethods) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // Apply theme + font size on mount and whenever they change
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    applyFontSize(settings.fontSize);
  }, [settings.fontSize]);

  const updateTheme = useCallback((theme: ThemeMode) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateFontSize = useCallback((fontSize: FontSize) => {
    setSettings((prev) => {
      const next = { ...prev, fontSize };
      saveSettings(next);
      return next;
    });
  }, []);

  const updatePaymentMethods = useCallback((methods: PaymentMethods) => {
    setSettings((prev) => {
      const next = { ...prev, paymentMethods: methods };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS, paymentMethods: { ...DEFAULTS.paymentMethods } });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTheme,
        updateFontSize,
        updatePaymentMethods,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export { SettingsContext, type SettingsContextValue };
