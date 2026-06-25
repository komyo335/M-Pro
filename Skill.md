# Skill.md — UI Changes Log

## Checkout Component — Customer Form Styling

### File: `src/components/Checkout.css`

Added comprehensive styling for the customer form section:

```css
/* ---- Customer info section ---- */
.checkout-customer {
  padding: 0 24px 16px;
}

.checkout-customer-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--sans);
  color: var(--text-h);
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.checkout-customer-toggle:hover {
  border-color: #3b82f6;
}

.checkout-customer-preview {
  font-size: 12px;
  font-weight: 400;
  color: var(--text);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Customer form ---- */
.checkout-customer-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
  padding: 14px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.checkout-customer-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.checkout-customer-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
}

/* ---- Customer name input ---- */
.checkout-customer-input {
  padding: 10px 12px;
  font-size: 14px;
  font-family: var(--sans);
  color: var(--text-h);
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.checkout-customer-input::placeholder {
  color: var(--text);
  opacity: 0.6;
}

.checkout-customer-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* ---- Autocomplete suggestions ---- */
.checkout-customer-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  list-style: none;
  margin: 4px 0 0;
  padding: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 200px;
  overflow-y: auto;
}

.checkout-customer-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  font-family: var(--sans);
  color: var(--text-h);
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  text-align: left;
}

.checkout-customer-suggestion:hover {
  background: var(--code-bg);
}

.checkout-customer-suggestion-meta {
  margin-left: auto;
  font-size: 11px;
  color: var(--text);
  font-family: var(--mono);
}

/* ---- Customer type / demographic button groups ---- */
.checkout-customer-btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.checkout-customer-btn {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--sans);
  color: var(--text);
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  white-space: nowrap;
}

.checkout-customer-btn:hover {
  border-color: #3b82f6;
}

.checkout-customer-btn.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  font-weight: 600;
}

.checkout-customer-btn span:first-child {
  font-size: 14px;
}

/* ---- Responsive ---- */
@media (max-width: 540px) {
  .checkout-customer-btn-group {
    flex-wrap: wrap;
  }

  .checkout-customer-btn {
    flex: none;
    width: calc(50% - 3px);
  }
}
```

---

## POS Dashboard — Remove Item Button Styling

### File: `src/components/POSDashboard.tsx`

Updated remove button to show label text:

```tsx
<button
  className="pos-product-remove"
  onClick={(e) => {
    e.stopPropagation();
    handleRemoveItem(product.id);
  }}
  aria-label={`Remove ${product.name}`}
  title={`Remove ${product.name}`}
>
  Remove
</button>
```

### File: `src/components/POSDashboard.css`

```css
/* ---- Product remove button ---- */
.pos-product-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: var(--sans);
  font-weight: 500;
  color: #ef4444;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, border-color 0.15s;
  line-height: 1;
  white-space: nowrap;
}

.pos-product-card-wrapper:hover .pos-product-remove {
  opacity: 1;
}

.pos-product-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.pos-product-remove:focus-visible {
  outline: 2px solid #ef4444;
  outline-offset: 1px;
  opacity: 1;
}
```

---

## POS Dashboard — Emoji Dropdown for Add Item Modal

### File: `src/components/POSDashboard.tsx`

Added category-specific emoji data and dropdown:

```tsx
const CATEGORY_EMOJIS: Record<string, string[]> = {
  drinks: ['☕', '🍵', '🧋', '🥤', '🍺', '🍷', '🧃', '🥛'],
  food: ['🍔', '🍕', '🌮', '🍜', '🍝', '🍱', '🥗', '🥪'],
  snacks: ['🍩', '🍪', '🧁', '🍰', '🥐', '🍿', '🥨', '🍫'],
  merch: ['👕', '🧢', '🎒', '☕', '🏷️', '📦', '🎁', '🛍️'],
};
```

Emoji dropdown in modal:

```tsx
<label className="pos-form-label">
  Emoji
  <select
    className="pos-form-input pos-emoji-dropdown"
    value={newItem.emoji}
    onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
  >
    <option value="">😀</option>
    {Object.values(CATEGORY_EMOJIS).flat().map((em) => (
      <option key={em} value={em}>{em}</option>
    ))}
  </select>
</label>
```

### File: `src/components/POSDashboard.css`

```css
/* ---- Emoji dropdown ---- */
.pos-emoji-dropdown {
  font-size: 24px;
  cursor: pointer;
  width: 80px;
  text-align: center;
}
```

---

## Summary of All Changes

| Component | File | Changes |
|-----------|------|---------|
| Checkout | `Checkout.css` | Customer form styles (toggle, form, input, suggestions, button groups) |
| POS Dashboard | `POSDashboard.tsx` | Remove button label, emoji dropdown |
| POS Dashboard | `POSDashboard.css` | Remove button style, emoji dropdown style |
