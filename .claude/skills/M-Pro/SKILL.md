---
name: M-Pro
description: "Project conventions, known issues, and development patterns for the M-Pro POS application. Use when making changes to this codebase."
allowed-tools: [Read, Bash, Edit, Write, Grep, Glob, Task, Agent]
---

# M-Pro

React + TypeScript + Vite POS system for a café. All persistence via localStorage. CSS custom properties (design tokens) for theming. No backend.

## Project commands

```bash
npm run dev      # Start Vite dev server (port 5174)
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # vite preview
```

## Architecture

```
App.tsx (auth gate + view router)
├── SettingsProvider (context — theme, font size, payment methods)
├── LoginForm
├── POSDashboard (main shell + sidebar menu)
│   ├── POS view: category tabs + product grid + cart sidebar
│   ├── OrdersPanel: order history + manual new-order form
│   ├── CustomerManagement: demographic tabs + customer grid + detail panel
│   ├── ReportsPanel: income KPIs, revenue breakdowns, top products, orders table
│   └── SettingsPanel: theme, font size, payment methods toggles
└── Checkout (full-screen overlay: bill + payment + confirmation)
```

## Key files

| File | Purpose |
|------|---------|
| `src/data/products.ts` | Product catalog, CartItem, Order, types, cart helpers, order persistence |
| `src/data/customers.ts` | Customer profiles, seed data, order→customer bridge (`updateCustomerFromOrder`) |
| `src/contexts/SettingsContext.tsx` | Settings context provider, localStorage persistence, theme/font application |
| `src/contexts/useSettings.ts` | `useSettings()` hook |
| `src/components/POSDashboard.tsx` | Main shell — sidebar routing, cart state, daily sales tracking |
| `src/components/Checkout.tsx` | Checkout overlay — bill, payment selection, order confirmation |
| `src/components/OrdersPanel.tsx` | Order history list + manual new-order form |
| `src/components/ReportsPanel.tsx` | Income KPIs, revenue breakdowns, hourly heat map, orders table |
| `src/components/CustomerManagement.tsx` | Customer grid with demographic filtering + detail sidebar |
| `src/components/SettingsPanel.tsx` | Theme/font/payment-method settings |
| `src/index.css` | Design tokens (`:root`, `[data-theme]`, `[data-font-size]`), global styles |

## localStorage keys

| Key | Stores | Module |
|-----|--------|--------|
| `mpro-pos-settings` | Settings object | SettingsContext |
| `mpro_orders` | Order[] | products.ts |
| `mpro_customers` | Customer[] | customers.ts |
| `mpro_daily_sales` | `{ date, total }` | POSDashboard + ReportsPanel |

## Styling conventions

- Design tokens only — never hardcode colors. Use `var(--text)`, `var(--border)`, `var(--bg)`, `var(--code-bg)`, `var(--text-h)`, `var(--accent)`, `var(--shadow)`.
- Interactive blue: `#3b82f6`. Error/destructive: `#ef4444`.
- Border radius: 10px (cards), 12px (panels), 8px (inputs/buttons).
- Font sizes: 22px (h2), 16px (section titles), 14px (body), 13px (labels), 11-12px (meta).
- Focus states: `outline: 2px solid #3b82f6; outline-offset: 2px`.
- Responsive: `@media (max-width: 768px)` in every component CSS file.
- CSS comment dividers: `/* ==== Section Name ==== */`.
- BEM-like class naming: `.component-section-element`.
- All panel root classes: `padding: 24px 32px`, `overflow-y: auto`.

## Component patterns

Every non-POS panel follows this structure:
1. Import its own `.css` file
2. Root: `<div className="x-panel">`
3. Header: `<h2>` title + optional `<p className="x-subtitle">`
4. Content using flex layouts / CSS grid for cards
5. Responsive breakpoint at 768px
6. All panels share design tokens from `index.css`

## Data flow: Order → Customer linkage

Every order completion path MUST call `updateCustomerFromOrder(order)`:
1. **POS Checkout**: `createOrder` → `saveOrder` → `updateCustomerFromOrder`
2. **Manual Order**: `createManualOrder` → `saveOrder` → `updateCustomerFromOrder`

`updateCustomerFromOrder` handles: find by ID, fallback match by name (case-insensitive), auto-create new customers for first-time buyers with a demographic.

## Known issues (from code review)

These are known and should be fixed when touching the relevant files:

1. **Checkout.tsx:71-77** — `setTimeout` calls `setState` after potential unmount. Use a mounted ref or cleanup.
2. **POSDashboard.tsx:113-119** — Daily sales incremented optimistically BEFORE checkout completes. If user cancels checkout, the daily sales total is already persisted. Move increment to `onOrderComplete`.
3. **LoginForm.tsx:44-46** — Credentials logged to console. Remove or guard behind dev-only check.
4. **createManualOrder** — Does not validate the `time` field before calling `setHours()`; can produce `Invalid Date`.
5. **ReportsPanel.tsx:136** — `loadDailySales()` memoized with `[]` — stale for session lifetime. Pass as prop or re-mount.
6. **Duplicated utils** — `formatDate`, `toHHMM`/`toTime`, `paymentLabel`, `customerTypeLabel`, `demographicLabel`, `getTodayKey` are copy-pasted across 3+ components. Extract to a shared utils module.
7. **App.css** — Entire file is dead code from Vite template. No components use `.hero`, `#next-steps`, `.ticks`, `.counter`. Delete the file and remove its import.
8. **SettingsPanel.tsx:129-136** — `<button>` nested inside `<label>` is invalid HTML. Restructure.
9. **products.ts:179-182** — Module-level mutable counter `_lineKeyCounter` for line keys. Use `crypto.randomUUID()` or timestamp+random instead.
10. **Product name typos** — `'Chips'` should be `'Chips'`, `'Brownie'` should be `'Brownie'`.
11. **customers.ts:65** — `getTodayKey()` returns unpadded `YYYY-M-D` format (pad function exists but is unused). Use the pad function for consistent lexicographic sorting.

## Pre-commit checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] New components follow existing panel structure
- [ ] Design tokens used (no hardcoded colors)
- [ ] Focus states on all interactive elements
- [ ] Responsive styles at 768px breakpoint
- [ ] Any new order path calls `updateCustomerFromOrder()`
- [ ] No new duplicate utility functions — check `src/data/products.ts` and `src/data/customers.ts` first
- [ ] `console.log` calls removed or guarded
