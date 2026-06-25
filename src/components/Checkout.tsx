import { useMemo, useState } from 'react';
import type { CartItem, CustomerType, CustomerDemographic, Product } from '../data/products';
import {
  calcSubtotal,
  calcFoodSubtotal,
  calcTax,
  calcItemCount,
  formatCurrency,
  TAX_RATE,
  CUSTOMER_TYPES,
  DEMOGRAPHICS,
  PRODUCTS,
  CATEGORIES,
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

  // ── Customer form state ─────────────────────────
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('dine-in');
  const [customerDemographic, setCustomerDemographic] = useState<CustomerDemographic | ''>('');

  const customers = useMemo(() => loadCustomers(), []);

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find((cust) => cust.id === id);
    if (c) {
      setCustomerDemographic(c.demographic);
    }
  };

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  // ── Other items display state ───────────────────
  const [showOtherItems, setShowOtherItems] = useState(false);
  const [otherItemsCategory, setOtherItemsCategory] = useState<string>('All');

  const otherItemsFiltered = useMemo(() => {
    const nonFood = PRODUCTS.filter((p) => p.category !== 'food');
    if (otherItemsCategory === 'All') return nonFood;
    return nonFood.filter((p) => p.category === otherItemsCategory.toLowerCase());
  }, [otherItemsCategory]);

  const otherCategories = CATEGORIES.filter((c) => c !== 'All' && c !== 'Food');

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
  const foodSubtotal = useMemo(() => calcFoodSubtotal(cart), [cart]);
  const tax = useMemo(() => calcTax(subtotal), [subtotal]);
  const total = subtotal + tax;
  const itemCount = useMemo(() => calcItemCount(cart), [cart]);

  // Group food items to "combine" pricing as the user requested
  const foodItems = useMemo(
    () => cart.filter((item) => item.product.category === 'food'),
    [cart],
  );
  const nonFoodItems = useMemo(
    () => cart.filter((item) => item.product.category !== 'food'),
    [cart],
  );

  const handleConfirm = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    // Simulate payment processing, then persist the order
    setTimeout(() => {
      const order = createOrder(cart, subtotal, tax, total, effectiveMethod);
      // Attach customer info if a customer was selected
      if (selectedCustomer) {
        order.customerName = selectedCustomer.name;
        order.customerType = customerType;
        order.customerId = selectedCustomer.id;
        if (customerDemographic) {
          order.customerDemographic = customerDemographic;
        } else {
          order.customerDemographic = selectedCustomer.demographic;
        }
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
              {foodSubtotal > 0 && (
                <span>Food total: {formatCurrency(foodSubtotal)}</span>
              )}
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

        {/* Bill / receipt body */}
        <div className="checkout-body">
          {/* ── Food section (combined pricing) ────── */}
          {foodItems.length > 0 && (
            <section className="checkout-section checkout-food">
              <h3 className="checkout-section-title">
                🍽️ Food Items — Combined Price
              </h3>
              <ul className="checkout-item-list">
                {foodItems.map((item) => (
                  <li key={item.product.id} className="checkout-item">
                    <span className="checkout-item-emoji" aria-hidden="true">
                      {item.product.emoji}
                    </span>
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">
                        {item.product.name}
                      </span>
                      <span className="checkout-item-unit">
                        {formatCurrency(item.product.price)} each
                      </span>
                    </div>
                    <span className="checkout-item-qty">×{item.quantity}</span>
                    <span className="checkout-item-line-total">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="checkout-category-subtotal">
                <span>Food Combined Total</span>
                <span>{formatCurrency(foodSubtotal)}</span>
              </div>
            </section>
          )}

          {/* ── Non-food section ──────────────────── */}
          {nonFoodItems.length > 0 && (
            <section className="checkout-section checkout-other">
              <h3 className="checkout-section-title">
                🛍️ Other Items
              </h3>
              <ul className="checkout-item-list">
                {nonFoodItems.map((item) => (
                  <li key={item.product.id} className="checkout-item">
                    <span className="checkout-item-emoji" aria-hidden="true">
                      {item.product.emoji}
                    </span>
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">
                        {item.product.name}
                      </span>
                      <span className="checkout-item-unit">
                        {formatCurrency(item.product.price)} each
                      </span>
                    </div>
                    <span className="checkout-item-qty">×{item.quantity}</span>
                    <span className="checkout-item-line-total">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Totals ─────────────────────────────── */}
        <div className="checkout-totals">
          <div className="checkout-totals-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {foodSubtotal > 0 && (
            <div className="checkout-totals-row checkout-totals-food">
              <span>↳ of which Food</span>
              <span>{formatCurrency(foodSubtotal)}</span>
            </div>
          )}
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

          {showCustomerForm && (
            <div className="checkout-customer-form">
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

        {/* ── Other items display ─────────────────── */}
        <div className="checkout-customer">
          <button
            className="checkout-customer-toggle"
            onClick={() => setShowOtherItems(!showOtherItems)}
            type="button"
          >
            <span>{showOtherItems ? '▾' : '▸'} 🛍️ Other Items</span>
            {!showOtherItems && (
              <span className="checkout-customer-preview">
                {otherItemsFiltered.length} items
              </span>
            )}
          </button>

          {showOtherItems && (
            <div className="checkout-customer-form">
              {/* Category filter */}
              <div className="checkout-customer-field">
                <label className="checkout-customer-label">Category</label>
                <div className="checkout-customer-btn-group">
                  <button
                    type="button"
                    className={`checkout-customer-btn ${otherItemsCategory === 'All' ? 'active' : ''}`}
                    onClick={() => setOtherItemsCategory('All')}
                  >
                    All
                  </button>
                  {otherCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`checkout-customer-btn ${otherItemsCategory === cat ? 'active' : ''}`}
                      onClick={() => setOtherItemsCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items list */}
              <div className="checkout-other-items-list">
                {otherItemsFiltered.map((p: Product) => (
                  <div key={p.id} className="checkout-other-item">
                    <span className="checkout-other-item-emoji">{p.emoji}</span>
                    <span className="checkout-other-item-name">{p.name}</span>
                    <span className="checkout-other-item-price">{formatCurrency(p.price)}</span>
                  </div>
                ))}
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
