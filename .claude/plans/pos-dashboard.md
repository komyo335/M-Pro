# Login → POS Dashboard Flow

## Summary
Two-page flow: Login form validates credentials → on success, navigates to the POS Dashboard. State-driven navigation in `App.tsx` (no router dependency).

## Files to create
- `src/components/POSDashboard.tsx` — Full POS dashboard
- `src/components/POSDashboard.css` — Dashboard styles

## Files to modify
- `src/App.tsx` — State-driven routing: `isAuthenticated` boolean swaps between `LoginForm` and `POSDashboard`
- `src/components/LoginForm.tsx` — Call `onLogin` prop on successful validation instead of just showing success message

## Flow
```
App (isAuthenticated state)
├── false → <LoginForm onLogin={() => setIsAuthenticated(true)} />
└── true  → <POSDashboard />
```

## LoginForm changes
- Remove the internal `submitted` success view
- Accept `onLogin: () => void` prop
- On successful validation, call `onLogin()` to navigate to dashboard

## POSDashboard architecture
```
┌─ Top bar: "M-Pro POS" title + daily sales figure ────────────────┐
│ ┌─ Menu ──┐ ┌─ Product catalog ──┐ ┌─ Cart (320px) ────────────┐│
│ │ 🛍️ POS  │ │ Category tabs       │ │ Cart items (qty +/- rem.) ││
│ │ 📋 Ord. │ │ Product grid        │ │ Subtotal / Tax 8% / Total││
│ │ 📦 Inv. │ │ (cards)             │ │ Checkout button (blue)    ││
│ │ 👥 Cust.│ │                     │ │                           ││
│ │ 📈 Rep. │ │                     │ │                           ││
│ │ ⚙️ Sett.│ │                     │ │                           ││
│ │         │ │                     │ │                           ││
│ │ 👤 Staff│ │                     │ │                           ││
│ └─────────┘ └─────────────────────┘ └───────────────────────────┘│
```
Menu collapses to icons-only (64px) and expands on hover to show labels (~200px). Compact icon-only on mobile (48px).

## Data model
- **Product**: `{ id, name, price, category, emoji }` — ~16 mock products
- **CartItem**: `{ product, quantity }`
- **Categories**: All, Drinks, Food, Snacks, Merch

## Styling
- Uses design tokens from `index.css`
- CSS Grid for catalog; fixed-width sidebar for cart
- Blue (#3b82f6) accent to match login button
- Responsive: stacks vertically on smaller screens
