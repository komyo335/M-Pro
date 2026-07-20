import { useMemo, useState } from 'react';
import type { CartItem, CustomerType, CustomerDemographic } from '../data/products';
import {
  calcSubtotal,
  calcTax,
  calcItemCount,
  formatCurrency,
  TAX_RATE,
  CUSTOMER_TYPES,
  DEMOGRAPHICS,
  createOrder,
  saveOrder,
} from '../data/products';
import { updateCustomerFromOrder, loadCustomers } from '../data/customers';
import { useSettings } from '../contexts/useSettings';
import './Checkout.css';

interface CheckoutProps {
  /** All cart items selected in the dashboard. */
  cart: CartItem[];
  /** Called when the user wants to go back to the dashboard. */
  onBack: () => void;
  /** Called after a successful order with the cleared cart. */
  onOrderComplete: () => void;
}

function Checkout({ cart, onBack, onOrderComplete }: CheckoutProps) {
  const { settings } = useSettings();
  const { paymentMethods: enabledPayments } = settings;

  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // ── Customer form state ─────────────────────────
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('dine-in');
  const [customerDemographic, setCustomerDemographic] = useState<CustomerDemographic | ''>('');

  const customers = useMemo(() => loadCustomers(), []);

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

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  // Build available payment options from settings
  const ALL_PAYMENT_OPTIONS = [
    ['cash', '💵', 'Cash'],
    ['card', '💳', 'Card'],
    ['mobile', '📱', 'Mobile Pay'],
  ] as const;

  const availablePayments = ALL_PAYMENT_OPTIONS.filter(
    ([key]) => enabledPayments[key],
  );

  // If current selection is disabled, fall back to first available
  const effectiveMethod = availablePayments.some(([k]) => k === paymentMethod)
    ? paymentMethod
    : availablePayments[0]?.[0] ?? 'cash';

  // ── Calculations ──────────────────────────────────
  const subtotal = useMemo(() => calcSubtotal(cart), [cart]);
  const tax = useMemo(() => calcTax(subtotal), [subtotal]);
  const total = subtotal + tax;
  const itemCount = useMemo(() => calcItemCount(cart), [cart]);

  const handleConfirm = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    // Simulate payment processing, then persist the order
    setTimeout(() => {
      const order = createOrder(cart, subtotal, tax, total, effectiveMethod);
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
      saveOrder(order);
      updateCustomerFromOrder(order);
      setIsProcessing(false);
      setIsConfirmed(true);
    }, 1200);
  };

  const handleDone = () => {
    onOrderComplete();
  };

  // ── Confirmation screen ───────────────────────────
  if (isConfirmed) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-panel">
          <div className="checkout-confirm">
            <span className="checkout-confirm-icon" aria-hidden="true">
              ✅
            </span>
            <h2>Order Confirmed!</h2>
            <p className="checkout-confirm-total">
              {formatCurrency(total)} paid via{' '}
              {effectiveMethod === 'cash'
                ? 'Cash'
                : effectiveMethod === 'card'
                  ? 'Card'
                  : 'Mobile Pay'}
            </p>
            <div className="checkout-confirm-details">
              <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>
            <button className="checkout-btn checkout-btn-primary" onClick={handleDone}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart guard ──────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-panel">
          <div className="checkout-empty">
            <span className="checkout-empty-icon" aria-hidden="true">🛒</span>
            <h2>Nothing to check out</h2>
            <p>Add items from the dashboard first.</p>
            <button className="checkout-btn checkout-btn-primary" onClick={onBack}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout bill view ───────────────────────
  return (
    <div className="checkout-overlay">
      <div className="checkout-panel">
        {/* Header */}
        <header className="checkout-header">
          <button
            className="checkout-back"
            onClick={onBack}
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
          <h2>Checkout</h2>
          <span className="checkout-header-count">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </header>

        {/* ── Totals ─────────────────────────────── */}
        <div className="checkout-totals">
          <div className="checkout-totals-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="checkout-totals-row">
            <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="checkout-totals-row checkout-totals-grand">
            <span>Grand Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* ── Customer info dropdown ──────────────── */}
        <div className="checkout-customer">
          <button
            className="checkout-customer-toggle"
            onClick={() => setShowCustomerForm(!showCustomerForm)}
            type="button"
          >
            <span>{showCustomerForm ? '▾' : '▸'} Customer Info</span>
            {selectedCustomer && !showCustomerForm && (
              <span className="checkout-customer-preview">
                {selectedCustomer.emoji} {selectedCustomer.name} · {customerType}
              </span>
            )}
          </button>

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

          {showCustomerForm && (
            <div className="checkout-customer-form">
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

              {/* Customer dropdown select */}
              <div className="checkout-customer-field">
                <label className="checkout-customer-label">Select Customer</label>
                <select
                  className="checkout-customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                >
                  <option value="">-- Walk-in Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({c.visits} visits · {formatCurrency(c.totalSpent)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer type (dine-in / takeout / delivery) */}
              <div className="checkout-customer-field">
                <label className="checkout-customer-label">Order Type</label>
                <div className="checkout-customer-btn-group">
                  {CUSTOMER_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      className={`checkout-customer-btn ${customerType === ct.value ? 'active' : ''}`}
                      onClick={() => setCustomerType(ct.value)}
                    >
                      <span>{ct.emoji}</span>
                      <span>{ct.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer demographic */}
              <div className="checkout-customer-field">
                <label className="checkout-customer-label">Demographic</label>
                <div className="checkout-customer-btn-group">
                  {DEMOGRAPHICS.filter((d) => d.value !== 'all').map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      className={`checkout-customer-btn ${customerDemographic === d.value ? 'active' : ''}`}
                      onClick={() =>
                        setCustomerDemographic(
                          customerDemographic === d.value ? '' : (d.value as CustomerDemographic),
                        )
                      }
                    >
                      <span>{d.icon}</span>
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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

        {/* ── Payment method ─────────────────────── */}
        <div className="checkout-payment">
          <label className="checkout-payment-label">Payment method</label>
          <div className="checkout-payment-options">
            {availablePayments.length === 0 ? (
              <p className="checkout-no-payments">No payment methods enabled</p>
            ) : (
              availablePayments.map(([value, emoji, label]) => (
                <button
                  key={value}
                  className={`checkout-payment-option ${paymentMethod === value ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(value)}
                >
                  <span aria-hidden="true">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Actions ────────────────────────────── */}
        <div className="checkout-actions">
          <button
            className="checkout-btn checkout-btn-primary"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="checkout-spinner" aria-hidden="true" />
            ) : null}
            {isProcessing
              ? 'Processing…'
              : `Pay ${formatCurrency(total)}`}
          </button>
          <button
            className="checkout-btn checkout-btn-ghost"
            onClick={onBack}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
