import { useState, useMemo, useEffect } from 'react';
import type { CartItem, Order, Product } from '../data/products';
import {
  PRODUCTS,
  CATEGORIES,
  calcSubtotal,
  calcTax,
  calcItemCount,
  formatCurrency,
  loadOrders,
} from '../data/products';
import { loadStaff } from '../data/staff';
import SettingsPanel from './SettingsPanel';
import OrdersPanel from './OrdersPanel';
import CustomerManagement from './CustomerManagement';
import StaffManagement from './StaffManagement';
import ReportsPanel from './ReportsPanel';
import './POSDashboard.css';

/* ---------- daily-sales persistence ---------- */
const SALES_KEY = 'mpro_daily_sales';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadDailySales(): number {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data.date === getTodayKey()) return data.total;
  } catch { /* corrupted — reset */ }
  return 0;
}

function saveDailySales(total: number): void {
  localStorage.setItem(
    SALES_KEY,
    JSON.stringify({ date: getTodayKey(), total }),
  );
}

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

interface NewItemForm {
  name: string;
  price: string;
  category: Product['category'];
  emoji: string;
}

const EMPTY_FORM: NewItemForm = { name: '', price: '', category: 'drinks', emoji: '' };

/* ---------- emoji picker groups ---------- */
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: '☕ Drinks',
    emojis: ['☕', '🍵', '🧋', '🥤', '🍺', '🍻', '🍷', '🥂', '🧃', '🥛', '🫖', '🍹', '🍸', '🫗', '🧉', '🍶'],
  },
  {
    label: '🍔 Food',
    emojis: ['🍔', '🍕', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍚', '🥩', '🍗', '🥓', '🍳', '🧇', '🥞', '🥐', '🍞', '🫔'],
  },
  {
    label: '🍪 Snacks',
    emojis: ['🍪', '🍩', '🧁', '🍰', '🎂', '🍫', '🍬', '🍭', '🧈', '🍿', '🥜', '🌰', '🥨', '🥯', '🫘', '🫛'],
  },
];


interface POSDashboardProps {
  /** Called when the user clicks Checkout with a non-empty cart. */
  onCheckout: (cart: CartItem[]) => void;
}

function POSDashboard({ onCheckout }: POSDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeMenu, setActiveMenu] = useState<string>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dailySales, setDailySales] = useState<number>(loadDailySales);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [staff, setStaff] = useState(loadStaff);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>(EMPTY_FORM);
  const [openEmojiGroup, setOpenEmojiGroup] = useState<string | null>(null);

  // Reload staff whenever a re-render picks up localStorage changes
  useEffect(() => {
    setStaff(loadStaff());
  }, []);

  const activeStaff = useMemo(
    () => staff.find((s) => s.status === 'active') ?? staff[0] ?? null,
    [staff],
  );

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

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const next = dailySales + total;
    setDailySales(next);
    saveDailySales(next);
    onCheckout(cart);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.price || !newItem.emoji.trim()) return;
    const price = parseFloat(newItem.price);
    if (isNaN(price) || price <= 0) return;

    const id = newItem.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const product: Product = {
      id,
      name: newItem.name.trim(),
      price,
      category: newItem.category,
      emoji: newItem.emoji.trim(),
    };

    PRODUCTS.push(product);
    setNewItem(EMPTY_FORM);
    setShowAddItem(false);
    setOpenEmojiGroup(null);
  };

  const handleRemoveItem = (productId: string) => {
    const idx = PRODUCTS.findIndex((p) => p.id === productId);
    if (idx === -1) return;
    PRODUCTS.splice(idx, 1);
    // Also remove from cart if present
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  return (
    <div className="pos-dashboard">
      {/* Top bar */}
      <header className="pos-topbar">
        <h1 className="pos-title">M-PRO CAFE</h1>
        <div className="pos-daily-sales">
          <span className="pos-daily-label">Today's Sales</span>
          <span className="pos-daily-value">
            {formatCurrency(dailySales)}
          </span>
        </div>
      </header>

      {/* Main content: menu + catalog + cart */}
      <div className={`pos-main ${activeMenu === 'settings' || activeMenu === 'orders' || activeMenu === 'customers' || activeMenu === 'staff' || activeMenu === 'reports' ? 'pos-main-settings' : ''}`}>
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
            {activeStaff && (
              <button
                className={`pos-menu-user ${activeMenu === 'staff' ? 'active' : ''}`}
                title={activeStaff.name}
                onClick={() =>
                  setActiveMenu(activeMenu === 'staff' ? 'pos' : 'staff')
                }
              >
                <span className="pos-menu-avatar" aria-hidden="true">{activeStaff.emoji}</span>
                <span className="pos-menu-label">{activeStaff.name}</span>
                <span className={`pos-menu-status pos-menu-status--${activeStaff.status}`} />
              </button>
            )}
          </div>
        </nav>

        {/* Content area: settings, orders, or catalog + cart */}
        {activeMenu === 'settings' ? (
          <SettingsPanel />
        ) : activeMenu === 'orders' ? (
          <OrdersPanel
            orders={orders}
            onOrdersChange={setOrders}
            onNavigateToReports={() => setActiveMenu('reports')}
          />
        ) : activeMenu === 'customers' ? (
          <CustomerManagement />
        ) : activeMenu === 'staff' ? (
          <StaffManagement />
        ) : activeMenu === 'reports' ? (
          <ReportsPanel
            orders={orders}
            onNavigateToOrders={() => setActiveMenu('orders')}
          />
        ) : (
          <>
            {/* Product catalog */}
            <section className="pos-catalog">
              {/* Category tabs + Add button */}
              <div className="pos-catalog-header">
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
                <button
                  className="pos-add-item-btn"
                  onClick={() => setShowAddItem(true)}
                  title="Add new item"
                >
                  <span className="pos-add-item-icon" aria-hidden="true">+</span>
                  <span className="pos-add-item-label">Add Item</span>
                </button>
              </div>

              {/* Product grid */}
              <div className="pos-product-grid">
                {filteredProducts.length === 0 ? (
                  <div className="pos-empty-catalog">
                    <p>No products in this category.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="pos-product-card-wrapper">
                      <button
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
                    </div>
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

                  <div className="pos-cart-actions">
                    <button
                      className="pos-clear-cart-btn"
                      onClick={handleClearCart}
                    >
                      Clear Cart
                    </button>
                    <button
                      className="pos-checkout-btn"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      Checkout — {formatCurrency(total)}
                    </button>
                  </div>
                </>
              )}
            </aside>
          </>
        )}
      </div>

      {/* Add New Item Modal */}
      {showAddItem && (
        <div className="pos-modal-overlay" onClick={() => { setShowAddItem(false); setOpenEmojiGroup(null); }}>
          <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3>Add New Item</h3>
              <button
                className="pos-modal-close"
                onClick={() => { setShowAddItem(false); setOpenEmojiGroup(null); }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="pos-modal-body">
              <div className="pos-form-label">
                <span>Emoji</span>
                {newItem.emoji && (
                  <span className="pos-emoji-selected">Selected: {newItem.emoji}</span>
                )}
                <div className="pos-emoji-picker">
                  {EMOJI_GROUPS.map((group) => {
                    const isOpen = openEmojiGroup === group.label;
                    return (
                      <div key={group.label} className={`pos-emoji-dropdown ${isOpen ? 'open' : ''}`}>
                        <button
                          type="button"
                          className="pos-emoji-dropdown-header"
                          onClick={() => setOpenEmojiGroup(isOpen ? null : group.label)}
                        >
                          <span>{group.label}</span>
                          <span className="pos-emoji-dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div className="pos-emoji-grid">
                            {group.emojis.map((em) => (
                              <button
                                key={em}
                                type="button"
                                className={`pos-emoji-btn ${newItem.emoji === em ? 'active' : ''}`}
                                onClick={() => setNewItem({ ...newItem, emoji: em })}
                                title={em}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <label className="pos-form-label">
                Name
                <input
                  type="text"
                  className="pos-form-input"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Product name"
                />
              </label>
              <label className="pos-form-label">
                Price ($)
                <input
                  type="number"
                  className="pos-form-input"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </label>
              <label className="pos-form-label">
                Category
                <select
                  className="pos-form-input"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value as Product['category'] })
                  }
                >
                  <option value="drinks">Drinks</option>
                  <option value="food">Food</option>
                  <option value="snacks">Snacks</option>
                  <option value="merch">Merch</option>
                </select>
              </label>
            </div>
            <div className="pos-modal-actions">
              <button
                className="pos-modal-cancel"
                onClick={() => { setShowAddItem(false); setOpenEmojiGroup(null); }}
              >
                Cancel
              </button>
              <button
                className="pos-modal-confirm"
                onClick={handleAddItem}
                disabled={!newItem.name.trim() || !newItem.price || !newItem.emoji.trim()}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POSDashboard;
