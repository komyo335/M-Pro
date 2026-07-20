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

.checkout-customer-input[readonly] {
  background: var(--code-bg);
  color: var(--text);
  cursor: default;
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

## Checkout Component — Remove Food Items Combined Price

### File: `src/components/Checkout.tsx`

Removed the "Food Items — Combined Price" section and food/non-food item grouping:

- Removed `calcFoodSubtotal` import
- Removed `foodSubtotal` memo calculation
- Removed `foodItems` / `nonFoodItems` memos (food/non-food grouping)
- Removed the "🍽️ Food Items — Combined Price" section with its category subtotal
- Removed "↳ of which Food" row from the totals block
- Removed "Food total" from the confirmation screen
- Replaced two separate sections (food + non-food) with a single unified item list showing all cart items

### File: `src/components/Checkout.css`

Removed unused CSS classes:
- `.checkout-section-title`
- `.checkout-category-subtotal`
- `.checkout-totals-food`

---

## Checkout Component — Remove Other Items Component

### File: `src/components/Checkout.tsx`

Removed the "Other Items" component entirely:

- Removed `Product` from type imports
- Removed `PRODUCTS` and `CATEGORIES` imports
- Removed `showOtherItems` / `otherItemsCategory` state
- Removed `otherItemsFiltered` memo and `otherCategories` derivation
- Removed the entire "🛍️ Other Items" toggle + category filter + items list JSX block

### File: `src/components/Checkout.css`

Removed unused CSS classes:
- `.checkout-other-items-list`
- `.checkout-other-item`
- `.checkout-other-item:hover`
- `.checkout-other-item-emoji`
- `.checkout-other-item-name`
- `.checkout-other-item-price`

---

## Checkout Component — Custom Scrollbars

### File: `src/components/Checkout.css`

Added styled scrollbars to multiple checkout sections:

**Panel scrollbar:**
```css
.checkout-panel {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.checkout-panel::-webkit-scrollbar {
  width: 6px;
}

.checkout-panel::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-panel::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.checkout-panel::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
```

**Body scrollbar:**
```css
.checkout-body {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.checkout-body::-webkit-scrollbar {
  width: 6px;
}

.checkout-body::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-body::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.checkout-body::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
```

**Customer form scrollbar:**
```css
.checkout-customer-form {
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.checkout-customer-form::-webkit-scrollbar {
  width: 6px;
}

.checkout-customer-form::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-customer-form::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.checkout-customer-form::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
```

**Customer summary items scrollbar:**
```css
.checkout-customer-summary-items {
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.checkout-customer-summary-items::-webkit-scrollbar {
  width: 5px;
}

.checkout-customer-summary-items::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-customer-summary-items::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.checkout-customer-summary-items::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
```

**Receipt body scrollbar:**
```css
.checkout-receipt-body {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.checkout-receipt-body::-webkit-scrollbar {
  width: 5px;
}

.checkout-receipt-body::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-receipt-body::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.checkout-receipt-body::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
```

---

## Checkout Component — Customer Summary Card

### File: `src/components/Checkout.tsx`

Added customer summary card that shows when a customer is selected:

```tsx
{/* Customer summary card */}
{selectedCustomer && (
  <div className="checkout-customer-summary">
    <div className="checkout-customer-summary-header">
      <span className="checkout-customer-summary-name">
        {selectedCustomer.emoji} {selectedCustomer.name}
      </span>
      <span className="checkout-customer-summary-type">
        {CUSTOMER_TYPES.find((ct) => ct.value === customerType)?.emoji}{' '}
        {CUSTOMER_TYPES.find((ct) => ct.value === customerType)?.label}
      </span>
    </div>
    {cart.length > 0 && (
      <ul className="checkout-customer-summary-items">
        {cart.map((item) => (
          <li key={item.product.id} className="checkout-customer-summary-item">
            <span className="checkout-customer-summary-item-emoji">
              {item.product.emoji}
            </span>
            <span className="checkout-customer-summary-item-name">
              {item.product.name}
            </span>
            <span className="checkout-customer-summary-item-price">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
)}
```

### File: `src/components/Checkout.css`

```css
/* ---- Customer summary card ---- */
.checkout-customer-summary {
  margin-top: 10px;
  padding: 12px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkout-customer-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.checkout-customer-summary-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h);
}

.checkout-customer-summary-type {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  background: var(--bg);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.checkout-customer-summary-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkout-customer-summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
  transition: background 0.12s;
}

.checkout-customer-summary-item:hover {
  background: var(--bg);
}

.checkout-customer-summary-item-emoji {
  font-size: 16px;
  flex-shrink: 0;
}

.checkout-customer-summary-item-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkout-customer-summary-item-price {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--mono);
  color: var(--text);
  flex-shrink: 0;
}
```

---

## Checkout Component — Receipt Body

### File: `src/components/Checkout.tsx`

Added toggleable receipt section that displays a formatted order receipt:

```tsx
const [showReceipt, setShowReceipt] = useState(false);

{/* ── Receipt body ─────────────────────────── */}
<div className="checkout-receipt">
  <button
    className="checkout-receipt-toggle"
    onClick={() => setShowReceipt(!showReceipt)}
    type="button"
  >
    <span>{showReceipt ? '▾' : '▸'} 🧾 Receipt</span>
    {!showReceipt && (
      <span className="checkout-receipt-preview">
        {itemCount} item{itemCount !== 1 ? 's' : ''} · {formatCurrency(total)}
      </span>
    )}
  </button>

  {showReceipt && (
    <div className="checkout-receipt-body">
      <div className="checkout-receipt-header">
        <span className="checkout-receipt-store">M-Pro</span>
        <span className="checkout-receipt-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="checkout-receipt-time">
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="checkout-receipt-divider" />

      <ul className="checkout-receipt-items">
        {cart.map((item) => (
          <li key={item.product.id} className="checkout-receipt-item">
            <span className="checkout-receipt-item-qty">{item.quantity}×</span>
            <span className="checkout-receipt-item-emoji">{item.product.emoji}</span>
            <span className="checkout-receipt-item-name">{item.product.name}</span>
            <span className="checkout-receipt-item-price">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="checkout-receipt-divider" />

      <div className="checkout-receipt-totals">
        <div className="checkout-receipt-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="checkout-receipt-row">
          <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="checkout-receipt-row checkout-receipt-grand">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="checkout-receipt-divider" />

      <div className="checkout-receipt-footer">
        {selectedCustomer && (
          <div className="checkout-receipt-row">
            <span>Customer</span>
            <span>{selectedCustomer.emoji} {selectedCustomer.name}</span>
          </div>
        )}
        <div className="checkout-receipt-row">
          <span>Type</span>
          <span>
            {CUSTOMER_TYPES.find((ct) => ct.value === customerType)?.emoji}{' '}
            {CUSTOMER_TYPES.find((ct) => ct.value === customerType)?.label}
          </span>
        </div>
        <div className="checkout-receipt-row">
          <span>Payment</span>
          <span>
            {effectiveMethod === 'cash' ? '💵 Cash' : effectiveMethod === 'card' ? '💳 Card' : '📱 Mobile'}
          </span>
        </div>
      </div>
    </div>
  )}
</div>
```

### File: `src/components/Checkout.css`

```css
/* ---- Receipt body ---- */
.checkout-receipt {
  padding: 0 20px 8px;
}

.checkout-receipt-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
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

.checkout-receipt-toggle:hover {
  border-color: #3b82f6;
}

.checkout-receipt-preview {
  font-size: 12px;
  font-weight: 400;
  color: var(--text);
  font-family: var(--mono);
}

.checkout-receipt-body {
  margin-top: 10px;
  padding: 16px;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--mono);
  font-size: 13px;
}

.checkout-receipt-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.checkout-receipt-store {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--sans);
  color: var(--text-h);
  letter-spacing: 1px;
}

.checkout-receipt-date {
  font-size: 12px;
  color: var(--text);
}

.checkout-receipt-time {
  font-size: 12px;
  color: var(--text);
}

.checkout-receipt-divider {
  border-top: 1px dashed var(--border);
  margin: 4px 0;
}

.checkout-receipt-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkout-receipt-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.checkout-receipt-item-qty {
  font-size: 12px;
  color: var(--text);
  min-width: 24px;
  text-align: right;
}

.checkout-receipt-item-emoji {
  font-size: 14px;
  flex-shrink: 0;
}

.checkout-receipt-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-h);
}

.checkout-receipt-item-price {
  flex-shrink: 0;
  text-align: right;
  min-width: 50px;
  color: var(--text-h);
}

.checkout-receipt-totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkout-receipt-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.checkout-receipt-row span:first-child {
  color: var(--text);
}

.checkout-receipt-row span:last-child {
  color: var(--text-h);
  text-align: right;
}

.checkout-receipt-grand {
  font-size: 15px;
  font-weight: 700;
  padding-top: 4px;
  border-top: 1px solid var(--border);
  margin-top: 2px;
}

.checkout-receipt-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkout-receipt-footer .checkout-receipt-row span:first-child {
  color: var(--text);
}

.checkout-receipt-footer .checkout-receipt-row span:last-child {
  color: var(--text-h);
}
```

---

## Checkout Component — Customer Name Field

### File: `src/components/Checkout.tsx`

Added customer name input field to the customer form:

```tsx
const [customerName, setCustomerName] = useState('');

const handleCustomerSelect = (id: string) => {
  setSelectedCustomerId(id);
  const c = customers.find((cust) => cust.id === id);
  if (c) {
    setCustomerName(c.name);
    setCustomerDemographic(c.demographic);
  } else {
    setCustomerName('');
  }
};

{/* Customer name */}
<div className="checkout-customer-field">
  <label className="checkout-customer-label">Customer Name</label>
  <input
    type="text"
    className="checkout-customer-input"
    placeholder="Enter customer name"
    value={selectedCustomer ? selectedCustomer.name : customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    readOnly={!!selectedCustomer}
  />
</div>
```

Updated order creation to save walk-in customer name:

```tsx
// Attach customer info
order.customerType = customerType;
if (selectedCustomer) {
  order.customerName = selectedCustomer.name;
  order.customerId = selectedCustomer.id;
  if (customerDemographic) {
    order.customerDemographic = customerDemographic;
  } else {
    order.customerDemographic = selectedCustomer.demographic;
  }
} else if (customerName.trim()) {
  order.customerName = customerName.trim();
}
```

### File: `src/components/Checkout.css`

```css
.checkout-customer-input[readonly] {
  background: var(--code-bg);
  color: var(--text);
  cursor: default;
}
```

Updated select padding to match input:

```css
.checkout-customer-select {
  padding: 10px 12px;
}
```

---

## Summary of All Changes

| Component | File | Changes |
|-----------|------|---------|
| Checkout | `Checkout.css` | Customer form styles (toggle, form, input, suggestions, button groups) |
| Checkout | `Checkout.tsx` | Removed food items combined price section |
| Checkout | `Checkout.css` | Removed unused food-related CSS classes |
| Checkout | `Checkout.tsx` | Removed other items component |
| Checkout | `Checkout.css` | Removed unused other-items CSS classes |
| Checkout | `Checkout.css` | Added custom scrollbars (panel, body, customer form, summary items, receipt) |
| Checkout | `Checkout.tsx` | Added customer summary card with name, type, and items |
| Checkout | `Checkout.css` | Added customer summary card styles |
| Checkout | `Checkout.tsx` | Added receipt body section (placed after customer info) |
| Checkout | `Checkout.css` | Added receipt body styles |
| Checkout | `Checkout.tsx` | Added customer name field (placed at top of form) |
| Checkout | `Checkout.css` | Added readonly input style, matched select padding |
| POS Dashboard | `POSDashboard.tsx` | Remove button label, emoji dropdown |
| POS Dashboard | `POSDashboard.css` | Remove button style, emoji dropdown style |
