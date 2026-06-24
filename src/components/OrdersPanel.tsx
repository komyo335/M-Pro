import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Order, CustomerType, CustomerDemographic, ManualOrderInput, FormLineItem } from '../data/products';
import {
  PRODUCTS,
  CUSTOMER_TYPES,
  DEMOGRAPHICS,
  saveOrder,
  formatCurrency,
  createManualOrder,
  freshLineKey,
} from '../data/products';
import { updateCustomerFromOrder } from '../data/customers';
import './OrdersPanel.css';

/* ── All products for the new-order form ──── */
const ALL_PRODUCTS = PRODUCTS;

/* ── Time helpers ───────────────────────────────── */
function toHHMM(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function paymentLabel(method: string): string {
  switch (method) {
    case 'cash': return 'Cash';
    case 'card': return 'Card';
    case 'mobile': return 'Mobile Pay';
    case 'manual': return 'Manual';
    default: return method;
  }
}

function customerTypeLabel(type: CustomerType | undefined): string {
  const found = CUSTOMER_TYPES.find((ct) => ct.value === type);
  return found ? `${found.emoji} ${found.label}` : '';
}

function demographicLabel(demo: CustomerDemographic | undefined): string {
  if (!demo) return '';
  const found = DEMOGRAPHICS.find((d) => d.value === demo);
  return found ? `${found.icon} ${found.label}` : '';
}

function orderItemSummary(order: Order): string {
  const names = order.items.map(
    (item) => `${item.product.emoji} ${item.product.name}`,
  );
  if (names.length === 0) return 'No items';
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1} more`;
}

/* ── Default line item ─────────────────────────── */
function defaultLineItem(): FormLineItem {
  return {
    key: freshLineKey(),
    productId: ALL_PRODUCTS[0]?.id ?? '',
    quantity: 1,
    price: ALL_PRODUCTS[0]?.price ?? 0,
  };
}

/* ── HH:MM for initial form time ───────────────── */
function currentHHMM(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ── Initial form state ─────────────────────────── */
const EMPTY_FORM: ManualOrderInput = {
  items: [defaultLineItem()],
  customerName: '',
  customerType: 'dine-in',
  customerDemographic: '',
  time: currentHHMM(),
};

/* ── Item-level calc helpers ────────────────────── */
function lineTotal(item: FormLineItem): number {
  return item.price * item.quantity;
}

function formItemCount(items: FormLineItem[]): number {
  return items.reduce((sum, li) => sum + li.quantity, 0);
}

function formSubtotal(items: FormLineItem[]): number {
  return items.reduce((sum, li) => sum + lineTotal(li), 0);
}

interface OrdersPanelProps {
  orders: Order[];
  onOrdersChange: Dispatch<SetStateAction<Order[]>>;
  onNavigateToReports?: () => void;
}

function OrdersPanel({ orders, onOrdersChange, onNavigateToReports }: OrdersPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ManualOrderInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  /* ── Item management ──────────────────────────── */
  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, defaultLineItem()] }));
    setFormError(null);
  };

  const removeItem = (key: string) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev; // keep at least one
      return { ...prev, items: prev.items.filter((li) => li.key !== key) };
    });
    setFormError(null);
  };

  const updateItem = (key: string, patch: Partial<Pick<FormLineItem, 'productId' | 'quantity' | 'price'>>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((li) => {
        if (li.key !== key) return li;
        const updated = { ...li, ...patch };
        // If product changed, sync price from catalog
        if (patch.productId) {
          const product = ALL_PRODUCTS.find((p) => p.id === patch.productId);
          if (product) updated.price = product.price;
        }
        return updated;
      }),
    }));
    setFormError(null);
  };

  /* ── Form submission ──────────────────────────── */
  const handleSubmit = () => {
    if (!form.customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (form.items.length === 0) {
      setFormError('Add at least one item.');
      return;
    }
    for (const li of form.items) {
      if (li.quantity < 1) {
        setFormError('Each item must have a quantity of at least 1.');
        return;
      }
      if (li.price <= 0) {
        setFormError('Each item must have a price greater than $0.');
        return;
      }
    }
    if (!form.time) {
      setFormError('Time is required.');
      return;
    }

    const order = createManualOrder(form);
    if (!order) {
      setFormError('Invalid product selection.');
      return;
    }

    saveOrder(order);
    updateCustomerFromOrder(order);
    onOrdersChange((prev) => [order, ...prev]);
    setForm({ ...EMPTY_FORM, time: form.time });
    setFormError(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormError(null);
    setForm(EMPTY_FORM);
  };

  const handleClearOrders = () => {
    if (orders.length === 0) return;
    if (!window.confirm('Clear all orders? This cannot be undone.')) return;
    try { localStorage.removeItem('mpro_orders'); } catch { /* ignore */ }
    onOrdersChange([]);
    setExpandedId(null);
    setShowForm(false);
  };

  /* ── Toggle expand ────────────────────────────── */
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ── Running counts ───────────────────────────── */
  const totalItems = formItemCount(form.items);
  const subtotal = formSubtotal(form.items);

  /* ── Header with + New Order button ────────────── */
  const header = (
    <header className="orders-header">
      <div className="orders-header-left">
        <h2>Orders</h2>
        <span className="orders-count">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>
      {!showForm && (
        <div className="orders-header-actions">
          {onNavigateToReports && (
            <button
              className="orders-reports-btn"
              onClick={onNavigateToReports}
            >
              📈 Reports
            </button>
          )}
          <button
            className="orders-clear-btn"
            onClick={handleClearOrders}
            disabled={orders.length === 0}
          >
            Clear Orders
          </button>
          <button
            className="orders-new-btn"
            onClick={() => setShowForm(true)}
          >
            + New Order
          </button>
        </div>
      )}
    </header>
  );

  /* ── Empty state ──────────────────────────────── */
  if (orders.length === 0 && !showForm) {
    return (
      <div className="orders-panel">
        {header}
        <div className="orders-empty">
          <span className="orders-empty-icon" aria-hidden="true">📋</span>
          <h2>No Orders Yet</h2>
          <p>Create a new order or complete a checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-panel">
      {header}

      {/* ════════════════════════════════════════════════
          New Order Form
          ════════════════════════════════════════════════ */}
      {showForm && (
        <form
          className="orders-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="orders-form-header">
            <h3 className="orders-form-title">New Order</h3>
            <span className="orders-form-item-count">
              {totalItems} item{totalItems !== 1 ? 's' : ''} · {form.items.length} line{form.items.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Line items ─────────────────────────── */}
          <div className="orders-form-items">
            {form.items.map((li, idx) => (
              <div key={li.key} className="orders-form-item-row">
                <span className="orders-form-item-num">{idx + 1}</span>

                {/* Product */}
                <div className="orders-form-item-product">
                  <select
                    className="orders-form-select orders-form-select--sm"
                    value={li.productId}
                    onChange={(e) =>
                      updateItem(li.key, { productId: e.target.value })
                    }
                  >
                    {ALL_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.emoji} {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty */}
                <div className="orders-form-item-qty">
                  <input
                    type="number"
                    className="orders-form-input orders-form-input--sm"
                    min={1}
                    max={99}
                    value={li.quantity}
                    onChange={(e) =>
                      updateItem(li.key, {
                        quantity: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                  />
                </div>

                {/* Price */}
                <div className="orders-form-item-price">
                  <input
                    type="number"
                    className="orders-form-input orders-form-input--sm"
                    step="0.01"
                    min={0.01}
                    value={li.price}
                    onChange={(e) =>
                      updateItem(li.key, {
                        price: Math.max(0.01, parseFloat(e.target.value) || 0),
                      })
                    }
                  />
                </div>

                {/* Line total */}
                <span className="orders-form-item-total">
                  {formatCurrency(lineTotal(li))}
                </span>

                {/* Remove */}
                <button
                  type="button"
                  className="orders-form-item-remove"
                  onClick={() => removeItem(li.key)}
                  disabled={form.items.length <= 1}
                  aria-label="Remove item"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* ── Add item button ────────────────────── */}
          <button type="button" className="orders-form-add-btn" onClick={addItem}>
            + Add Item
          </button>

          {/* ── Running subtotal ───────────────────── */}
          <div className="orders-form-subtotal">
            <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* ── Customer name ──────────────────────── */}
          <label className="orders-form-field">
            <span className="orders-form-label">Customer Name</span>
            <input
              type="text"
              className="orders-form-input"
              placeholder="e.g. Jane Smith"
              value={form.customerName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, customerName: e.target.value }))
              }
            />
          </label>

          {/* ── Customer type ──────────────────────── */}
          <label className="orders-form-field">
            <span className="orders-form-label">Customer Type</span>
            <div className="orders-form-type-group">
              {CUSTOMER_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  className={`orders-form-type-btn ${form.customerType === ct.value ? 'active' : ''}`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, customerType: ct.value }))
                  }
                >
                  <span aria-hidden="true">{ct.emoji}</span>
                  <span>{ct.label}</span>
                </button>
              ))}
            </div>
          </label>

          {/* ── Customer demographic ───────────────── */}
          <label className="orders-form-field">
            <span className="orders-form-label">Customer Demographic</span>
            <div className="orders-form-type-group">
              {DEMOGRAPHICS.filter((d) => d.value !== 'all').map((demo) => (
                <button
                  key={demo.value}
                  type="button"
                  className={`orders-form-type-btn ${form.customerDemographic === demo.value ? 'active' : ''}`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, customerDemographic: demo.value as CustomerDemographic }))
                  }
                >
                  <span aria-hidden="true">{demo.icon}</span>
                  <span>{demo.label}</span>
                </button>
              ))}
            </div>
          </label>

          {/* ── Time ───────────────────────────────── */}
          <label className="orders-form-field">
            <span className="orders-form-label">Time</span>
            <input
              type="time"
              className="orders-form-input"
              value={form.time}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, time: e.target.value }))
              }
            />
          </label>

          {/* ── Error ──────────────────────────────── */}
          {formError && (
            <p className="orders-form-error">{formError}</p>
          )}

          {/* ── Actions ────────────────────────────── */}
          <div className="orders-form-actions">
            <button type="submit" className="orders-form-submit">
              Create Order — {formatCurrency(subtotal)}
            </button>
            <button
              type="button"
              className="orders-form-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════
          Order list
          ════════════════════════════════════════════════ */}
      <div className="orders-list">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;

          return (
            <article
              key={order.id}
              className={`orders-card ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Summary row */}
              <button
                className="orders-card-summary"
                onClick={() => toggleExpand(order.id)}
                aria-expanded={isExpanded}
                aria-label={`Order ${order.id}`}
              >
                <div className="orders-card-left">
                  <div className="orders-card-topline">
                    <span className="orders-card-customer">
                      {order.customerName || 'Walk-in'}
                    </span>
                    {order.customerType && (
                      <span className="orders-card-type">
                        {customerTypeLabel(order.customerType)}
                      </span>
                    )}
                    {order.customerDemographic && (
                      <span className="orders-card-demographic">
                        {demographicLabel(order.customerDemographic)}
                      </span>
                    )}
                  </div>
                  <span className="orders-card-itemline">
                    {orderItemSummary(order)}
                  </span>
                  <span className="orders-card-meta">
                    {order.id} · {formatDate(order.createdAt)} {toHHMM(order.createdAt)}
                  </span>
                </div>
                <div className="orders-card-right">
                  <span className="orders-card-total">
                    {formatCurrency(order.total)}
                  </span>
                  <span className="orders-card-payment">
                    {paymentLabel(order.paymentMethod)}
                  </span>
                  <span
                    className={`orders-card-chevron ${isExpanded ? 'open' : ''}`}
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="orders-card-detail">
                  {order.customerName && (
                    <div className="orders-detail-customer">
                      <span className="orders-detail-customer-name">
                        👤 {order.customerName}
                      </span>
                      {order.customerType && (
                        <span className="orders-detail-customer-type">
                          {customerTypeLabel(order.customerType)}
                        </span>
                      )}
                    </div>
                  )}
                  {order.customerDemographic && (
                    <div className="orders-detail-demographic">
                      <span className="orders-detail-demographic-label">
                        Customer Segment
                      </span>
                      <span className="orders-detail-demographic-value">
                        {demographicLabel(order.customerDemographic)}
                      </span>
                    </div>
                  )}

                  <ul className="orders-detail-items">
                    {order.items.map((item) => (
                      <li key={item.product.id} className="orders-detail-item">
                        <span className="orders-detail-emoji" aria-hidden="true">
                          {item.product.emoji}
                        </span>
                        <span className="orders-detail-name">
                          {item.product.name}
                        </span>
                        <span className="orders-detail-qty">
                          ×{item.quantity}
                        </span>
                        <span className="orders-detail-price">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="orders-detail-totals">
                    <div className="orders-detail-row">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="orders-detail-row">
                      <span>Tax</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <div className="orders-detail-row orders-detail-grand">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <div className="orders-detail-row">
                      <span>Payment</span>
                      <span>{paymentLabel(order.paymentMethod)}</span>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersPanel;
