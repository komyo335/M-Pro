import { useMemo, useState } from 'react';
import type { CartItem } from '../data/products';
import {
  calcSubtotal,
  calcFoodSubtotal,
  calcTax,
  calcItemCount,
  formatCurrency,
  TAX_RATE,
} from '../data/products';
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
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

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
    // Simulate payment processing
    setTimeout(() => {
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
              {paymentMethod === 'cash'
                ? 'Cash'
                : paymentMethod === 'card'
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

        {/* ── Payment method ─────────────────────── */}
        <div className="checkout-payment">
          <label className="checkout-payment-label">Payment method</label>
          <div className="checkout-payment-options">
            {([
              ['cash', '💵', 'Cash'],
              ['card', '💳', 'Card'],
              ['mobile', '📱', 'Mobile Pay'],
            ] as const).map(([value, emoji, label]) => (
              <button
                key={value}
                className={`checkout-payment-option ${paymentMethod === value ? 'active' : ''}`}
                onClick={() => setPaymentMethod(value)}
              >
                <span aria-hidden="true">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
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
