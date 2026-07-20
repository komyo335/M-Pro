# CLAUDE.md — M-Pro Project Guide

## Project Overview

M-Pro is a **POS (Point of Sale) system** for a café, built with **React 19 + TypeScript + Vite 8**. It uses **localStorage** for all persistence and **CSS custom properties (design tokens)** for theming. The app runs entirely client-side with no backend database.

- **Package name**: `mpro-scaffold`
- **Node**: Uses ES modules (`"type": "module"`)
- **Scripts**: `npm run dev` (Vite), `npm run build` (tsc + vite build), `npm run lint` (ESLint)

## Architecture

```
App.tsx (auth gate + view routing)
├── SettingsProvider (context, wraps entire app)
├── LoginForm → authentication screen
├── POSDashboard (main shell with sidebar menu)
│   ├── POS view: category tabs + product grid + cart sidebar
│   ├── Orders view: order history + manual order form
│   ├── Customers view: demographic tabs + customer grid + detail panel
│   ├── Reports view: income KPIs, revenue breakdowns, top products, orders table
│   └── Settings view: theme, font size, payment methods toggles
└── Checkout (full-screen overlay: bill + payment + confirmation)
```

### Server (`server/`)
- Express.js backend with separate `package.json`
- Environment variables in `server/.env` (copy from `.env.example`)
- Has its own `node_modules`

## File Structure

```
src/
├── App.tsx              # Root: auth gate, view routing (dashboard ↔ checkout)
├── App.css              # Global app styles
├── main.tsx             # Entry point
├── index.css            # Design tokens (CSS custom properties), theme selectors
├── assets/              # Static assets
├── components/
│   ├── LoginForm.tsx/.css       # Authentication screen
│   ├── POSDashboard.tsx/.css    # Main shell: sidebar + content routing
│   ├── Checkout.tsx/.css        # Full-screen checkout overlay
│   ├── OrdersPanel.tsx/.css     # Order history + manual order form
│   ├── CustomerManagement.tsx/.css  # Customer profiles with demographic tabs
│   ├── ReportsPanel.tsx/.css    # Analytics dashboard with charts
│   ├── SettingsPanel.tsx/.css   # Theme, font size, payment method settings
│   └── StaffManagement.tsx/.css # Staff scheduling/management
├── contexts/
│   ├── SettingsContext.tsx       # Settings state + localStorage persistence
│   └── useSettings.ts           # Hook to consume settings context
└── data/
    ├── products.ts    # Products, orders, cart types, order CRUD
    ├── customers.ts   # Customer profiles, order-to-customer linkage
    ├── reports.ts     # Report calculation helpers
    ├── staff.ts       # Staff data models
    └── users.ts       # User authentication data
```

## Data Models

### Products (`src/data/products.ts`)
- **Product**: `{ id, name, price, category: 'drinks'|'food'|'snacks'|'merch', emoji }`
- **CartItem**: `{ product: Product, quantity: number }`
- **Order**: `{ id, items: CartItem[], subtotal, tax, total, paymentMethod, createdAt, customerName?, customerType?, customerId?, customerDemographic? }`
- **CustomerType**: `'dine-in' | 'takeout' | 'delivery'`
- **CustomerDemographic**: `'boy' | 'girl' | 'children' | 'men' | 'women'`
- **DEMOGRAPHICS** array: `[{ value, label, icon }]` — includes `'all'` entry for filter tabs
- **CUSTOMER_TYPES** array: `[{ value: CustomerType, label, emoji }]`
- Helpers: `calcSubtotal`, `calcFoodSubtotal`, `calcTax`, `calcItemCount`, `formatCurrency`, `findProduct`
- Order CRUD: `loadOrders()`, `saveOrder(order)`, `createOrder(...)`, `createManualOrder(...)`

### Customers (`src/data/customers.ts`)
- **Customer**: `{ id, name, demographic: CustomerDemographic, visits, totalSpent, lastVisit, favoriteItem, emoji }`
- `loadCustomers()` — reads `mpro_customers` from localStorage, falls back to seed data (12 customers)
- `saveCustomers(customers)` — persists to localStorage
- `updateCustomerFromOrder(order)` — **critical bridge function**:
  1. Matches by `order.customerId` first, then by `order.customerName` (case-insensitive)
  2. If found: increments visits, adds to totalSpent, sets lastVisit, updates favoriteItem
  3. If not found but order has name + demographic: creates new Customer
- Seed data: `SEED_CUSTOMERS` (12 entries, 2-3 per demographic)

### Settings (`src/contexts/SettingsContext.tsx`)
- **Settings**: `{ theme: 'system'|'light'|'dark', fontSize: 'small'|'medium'|'large', paymentMethods: { cash, card, mobile } }`
- Applied via `data-theme` and `data-font-size` attributes on `<html>`
- At least one payment method must stay enabled

## localStorage Keys

| Key | Stores | Module |
|-----|--------|--------|
| `mpro-pos-settings` | Settings object | SettingsContext |
| `mpro_orders` | Order[] | products.ts |
| `mpro_customers` | Customer[] | customers.ts |
| `mpro_daily_sales` | `{ date, total }` | POSDashboard + ReportsPanel |

## Design System

### CSS Custom Properties (in `index.css`)
```css
--text, --text-h, --bg, --border, --code-bg,
--accent, --accent-bg, --shadow,
--sans, --heading, --mono
```

### Theme Support
- Auto-detects `prefers-color-scheme: dark`
- Override with `[data-theme="dark"]` or `[data-theme="light"]` on `<html>`
- Font sizes: `[data-font-size="small"]` (15px), `"medium"` (18px), `"large"` (21px)

### Styling Conventions
- Comment dividers: `/* ============ Section ============ */`
- BEM-like naming: `.component-section-element`
- Focus states: `outline: 2px solid #3b82f6; outline-offset: 2px`
- Interactive blue: `#3b82f6` (selected tabs, buttons, borders)
- Error/destructive: `#ef4444`
- Responsive breakpoint: `@media (max-width: 768px)` in every component
- Font sizes: 22px (h2), 16px (section title), 14px (body), 13px (labels), 11-12px (meta)
- Border radius: 10px (cards), 12px (panels), 8px (inputs/buttons)
- All panels: `padding: 24px 32px`, `overflow-y: auto`

## Data Flow

### Order → Customer Linkage
Every order creation path **MUST** call `updateCustomerFromOrder(order)`:
1. **POS Checkout** (`Checkout.tsx`): `createOrder` → `saveOrder` → `updateCustomerFromOrder`
2. **Manual Order** (`OrdersPanel.tsx`): `createManualOrder` → `saveOrder` → `updateCustomerFromOrder`

### POSDashboard Routing
```
activeMenu === 'settings'   → <SettingsPanel />
activeMenu === 'orders'     → <OrdersPanel />
activeMenu === 'customers'  → <CustomerManagement />
activeMenu === 'reports'    → <ReportsPanel />
else                        → POS view (catalog + cart)
```

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| `ui-builder` | `.claude/agents/ui-builder.md` | Create/modify UI components, layouts, styling |
| `mcp-data-implementer` | `.claude/agents/mcp-data-implementer.md` | MCP server setup, data schemas, tool definitions |
| `m-pro-feature-builder` | (referenced in Skill.md) | Build/extend POS features, data models, persistence |

## Available Skills

| Skill | File | Purpose |
|-------|------|---------|
| `code-reviewer` | `.claude/skills/code-reviewer.md` | Code review |

## MCP Servers (from `.mcp.json`)
- **context-awesome** — search awesome lists for resources/libraries
- **context7** — query up-to-date documentation for libraries
- **magic** — 21st.dev UI component builder/inspiration
- **chrome-devtools** — browser DevTools integration

## Development Guidelines

### When Building New Features
1. Add types/interfaces in the appropriate `src/data/` file
2. Use existing design tokens from `index.css` — **never hardcode colors**
3. Match existing component structure: header → content → responsive
4. Follow CSS class naming conventions (BEM-like)
5. Wire into `POSDashboard.tsx` via the menu system
6. Use localStorage persistence if data is consumed by other panels
7. Call `updateCustomerFromOrder()` from order completion paths
8. Run `npx tsc --noEmit` + `npx vite build` to verify before declaring done

### Component Pattern
Each panel follows:
1. Import its own `.css` file
2. Root: `<div className="x-panel">`
3. Header with `<h2>` title and optional `<p className="x-subtitle">`
4. Content area using flex layouts, CSS grid for cards
5. Responsive at 768px (single-column)

## Git

- **Main branch**: `main`
- **Current branch**: `dev-1`
- **Git user**: komyo
- Commit style: short descriptive messages

## Key Files Reference

- `Skill.md` — UI changes log (detailed changelog of all UI modifications)
- `m-pro-feature-builder.md` — Comprehensive feature builder agent documentation
- `evidence-claude-code-usage.md` — Evidence of Claude Code usage
- `Slides/pitch.md` — Project pitch/presentation
