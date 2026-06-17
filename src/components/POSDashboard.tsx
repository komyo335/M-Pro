import { useState, useMemo } from 'react';
import type { CartItem } from '../data/products';
import {
  PRODUCTS,
  CATEGORIES,
  calcSubtotal,
  calcTax,
  calcItemCount,
  formatCurrency,
} from '../data/products';
import './POSDashboard.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'pos', label: 'POS', icon: '🛍️' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

interface POSDashboardProps {
  /** Called when the user clicks Checkout with a non-empty cart. */
  onCheckout: (cart: CartItem[]) => void;
}

function POSDashboard({ onCheckout }: POSDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeMenu, setActiveMenu] = useState<string>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return PRODUCTS;
    return PRODUCTS.filter(
      (p) => p.category === activeCategory.toLowerCase(),
    );
  }, [activeCategory]);

  const subtotal = useMemo(() => calcSubtotal(cart), [cart]);
  const tax = useMemo(() => calcTax(subtotal), [subtotal]);
  const total = subtotal + tax;
  const itemCount = useMemo(() => calcItemCount(cart), [cart]);

  const dailySales = useMemo(() => {
    // Simulated daily sales — in a real app this would come from a backend
    return 284.50;
  }, []);

  const addToCart = (product: (typeof PRODUCTS)[number]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0);
      return next;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCheckout(cart);
  };

  return (
    <div className="pos-dashboard">
      {/* Top bar */}
      <header className="pos-topbar">
        <h1 className="pos-title">M-Pro POS</h1>
        <div className="pos-daily-sales">
          <span className="pos-daily-label">Today's Sales</span>
          <span className="pos-daily-value">
            {formatCurrency(dailySales)}
          </span>
        </div>
      </header>

      {/* Main content: menu + catalog + cart */}
      <div className="pos-main">
        {/* Left menu bar — icons collapsed, labels on hover */}
        <nav className="pos-menu" aria-label="Main navigation">
          <ul className="pos-menu-list">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`pos-menu-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                  aria-current={activeMenu === item.id ? 'page' : undefined}
                  title={item.label}
                >
                  <span className="pos-menu-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="pos-menu-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="pos-menu-footer">
            <div className="pos-menu-user" title="Staff">
              <span className="pos-menu-avatar" aria-hidden="true">👤</span>
              <span className="pos-menu-label">Staff</span>
            </div>
          </div>
        </nav>

        {/* Product catalog */}
        <section className="pos-catalog">
          {/* Category tabs */}
          <nav className="pos-categories" role="tablist" aria-label="Product categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`pos-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Product grid */}
          <div className="pos-product-grid">
            {filteredProducts.length === 0 ? (
              <div className="pos-empty-catalog">
                <p>No products in this category.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  className="pos-product-card"
                  onClick={() => addToCart(product)}
                >
                  <span className="pos-product-emoji" aria-hidden="true">
                    {product.emoji}
                  </span>
                  <span className="pos-product-name">{product.name}</span>
                  <span className="pos-product-price">
                    {formatCurrency(product.price)}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Cart sidebar */}
        <aside className="pos-cart">
          <div className="pos-cart-header">
            <h2>Cart</h2>
            {itemCount > 0 && (
              <span className="pos-cart-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <span className="pos-cart-empty-icon" aria-hidden="true">🛒</span>
              <p>Your cart is empty</p>
              <p className="pos-cart-hint">Tap a product to add it</p>
            </div>
          ) : (
            <>
              <ul className="pos-cart-items">
                {cart.map((item) => (
                  <li key={item.product.id} className="pos-cart-item">
                    <span className="pos-cart-item-emoji" aria-hidden="true">
                      {item.product.emoji}
                    </span>
                    <div className="pos-cart-item-info">
                      <span className="pos-cart-item-name">
                        {item.product.name}
                      </span>
                      <span className="pos-cart-item-price">
                        {formatCurrency(item.product.price)}
                      </span>
                    </div>
                    <div className="pos-cart-item-qty">
                      <button
                        className="pos-qty-btn"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        −
                      </button>
                      <span className="pos-qty-value">{item.quantity}</span>
                      <button
                        className="pos-qty-btn"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="pos-cart-remove"
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              <div className="pos-cart-totals">
                <div className="pos-cart-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="pos-cart-row">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="pos-cart-row pos-cart-total">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                className="pos-checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Checkout — {formatCurrency(total)}
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default POSDashboard;
