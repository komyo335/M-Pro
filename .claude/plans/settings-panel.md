# POS Settings Panel

## Summary
Add a Settings panel to the POS Dashboard, accessible via the existing ⚙️ Settings menu button. Settings are persisted to localStorage. Initial scope: Theme/display (dark/light/system mode, font size) and Payment methods (enable/disable Cash, Card, Mobile Pay).

## Files to create
- `src/contexts/SettingsContext.tsx` — React context with `useSettings` hook; reads/writes localStorage
- `src/components/SettingsPanel.tsx` — Settings UI replacing catalog+cart when active
- `src/components/SettingsPanel.css` — Settings panel styles

## Files to modify
- `src/index.css` — Add `[data-theme]` and `[data-font-size]` attribute selectors for user-controlled theming
- `src/App.tsx` — Wrap app in `<SettingsProvider>`, apply theme attributes to `<html>`
- `src/components/POSDashboard.tsx` — When `activeMenu === 'settings'`, render `<SettingsPanel>` instead of catalog+cart
- `src/components/Checkout.tsx` — Read enabled payment methods from SettingsContext, filter the payment options

## Settings data model
```ts
interface Settings {
  theme: 'system' | 'light' | 'dark';   // default: 'system'
  fontSize: 'small' | 'medium' | 'large'; // default: 'medium'
  paymentMethods: {
    cash: boolean;    // default: true
    card: boolean;    // default: true
    mobile: boolean;  // default: true
  };
}
```

## Component layout
```
POSDashboard (activeMenu === 'settings')
├── Top bar (unchanged)
├── Main area
│   ├── Menu sidebar (⚙️ Settings highlighted)
│   └── SettingsPanel (replaces catalog + cart)
│       ├── Header: "Settings"
│       ├── Section: Display
│       │   ├── Theme: System / Light / Dark (radio group)
│       │   └── Font size: Small / Medium / Large (radio group)
│       └── Section: Payment Methods
│           ├── Cash toggle (switch/checkbox)
│           ├── Card toggle (switch/checkbox)
│           └── Mobile Pay toggle (switch/checkbox)
```

## Theme application strategy
- On mount, read `theme` from localStorage → apply `data-theme` attribute to `<html>`
- CSS uses `[data-theme="dark"]` / `[data-theme="light"]` attribute selectors to override `:root` variables
- `data-theme="system"` (or no attribute) falls back to existing `prefers-color-scheme` media query
- `data-font-size` on `<html>` scales the base font: small=15px, medium=18px, large=21px

## Payment method integration
- SettingsContext provides `paymentMethods` object
- Checkout reads enabled methods, filters the payment options array
- At least one payment method must remain enabled (guard in settings UI)

## Edge cases
- **localStorage unavailable** (private browsing): fall back to in-memory defaults, app works normally
- **All payment methods disabled**: prevent toggling off the last remaining method
- **First load**: defaults applied (system theme, medium font, all payments enabled)
- **Corrupted localStorage**: catch JSON parse errors, fall back to defaults
