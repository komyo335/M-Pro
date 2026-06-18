import type { ThemeMode, FontSize } from '../contexts/SettingsContext';
import { useSettings } from '../contexts/useSettings';
import './SettingsPanel.css';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'System', icon: '🖥️' },
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
];

const FONT_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

function SettingsPanel() {
  const {
    settings,
    updateTheme,
    updateFontSize,
    updatePaymentMethods,
    resetSettings,
  } = useSettings();

  const { theme, fontSize, paymentMethods } = settings;

  const handlePaymentToggle = (method: keyof typeof paymentMethods) => {
    const current = paymentMethods[method];
    // Prevent disabling the last remaining payment method
    const enabledCount = Object.values(paymentMethods).filter(Boolean).length;
    if (current && enabledCount <= 1) return;
    updatePaymentMethods({ ...paymentMethods, [method]: !current });
  };

  return (
    <div className="settings-panel">
      <div className="settings-inner">
        {/* ── Header ────────────────────────────────────── */}
        <header className="settings-header">
          <h2>Settings</h2>
          <p className="settings-subtitle">
            Customize your POS experience. Changes are saved automatically.
          </p>
        </header>

        {/* ── Display section ───────────────────────────── */}
        <section className="settings-section">
          <h3 className="settings-section-title">Display</h3>

          {/* Theme */}
          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Theme</legend>
            <div className="settings-radio-group">
              {THEME_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`settings-radio-card ${theme === opt.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={opt.value}
                    checked={theme === opt.value}
                    onChange={() => updateTheme(opt.value)}
                    className="settings-radio-input"
                  />
                  <span className="settings-radio-icon" aria-hidden="true">
                    {opt.icon}
                  </span>
                  <span className="settings-radio-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Font Size */}
          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Font Size</legend>
            <div className="settings-radio-group">
              {FONT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`settings-radio-card ${fontSize === opt.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={opt.value}
                    checked={fontSize === opt.value}
                    onChange={() => updateFontSize(opt.value)}
                    className="settings-radio-input"
                  />
                  <span className="settings-radio-label">{opt.label}</span>
                  <span className="settings-font-preview" data-size={opt.value}>
                    Aa
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* ── Payment Methods section ───────────────────── */}
        <section className="settings-section">
          <h3 className="settings-section-title">Payment Methods</h3>
          <p className="settings-section-desc">
            Choose which payment options appear during checkout.
          </p>

          <div className="settings-toggle-list">
            {([
              ['cash', '💵', 'Cash'],
              ['card', '💳', 'Card'],
              ['mobile', '📱', 'Mobile Pay'],
            ] as const).map(([key, emoji, label]) => {
              const enabled = paymentMethods[key];
              const isLast = Object.values(paymentMethods).filter(Boolean).length <= 1 && enabled;
              return (
                <label
                  key={key}
                  className={`settings-toggle ${enabled ? 'enabled' : ''}`}
                  title={isLast ? 'At least one payment method must remain enabled' : undefined}
                >
                  <span className="settings-toggle-icon" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className="settings-toggle-label">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Toggle ${label}`}
                    className={`settings-switch ${enabled ? 'on' : 'off'}`}
                    onClick={() => handlePaymentToggle(key)}
                    disabled={isLast}
                  >
                    <span className="settings-switch-thumb" />
                  </button>
                </label>
              );
            })}
          </div>
        </section>

        {/* ── Reset ─────────────────────────────────────── */}
        <section className="settings-section settings-reset">
          <button
            type="button"
            className="settings-reset-btn"
            onClick={resetSettings}
          >
            Reset to defaults
          </button>
        </section>
      </div>
    </div>
  );
}

export default SettingsPanel;
