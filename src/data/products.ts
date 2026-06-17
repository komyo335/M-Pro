/**
 * Product database — single source of truth for the POS catalog.
 * All pricing and product metadata lives here so checkout, dashboard,
 * and future reporting all read from the same dataset.
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'drinks' | 'food' | 'snacks' | 'merch';
  emoji: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const PRODUCTS: Product[] = [
  // ── Drinks ──────────────────────────────────────────
  { id: 'coffee',  name: 'Coffee',       price: 3.50, category: 'drinks', emoji: '☕' },
  { id: 'tea',     name: 'Tea',          price: 2.75, category: 'drinks', emoji: '🍵' },
  { id: 'juice',   name: 'Orange Juice', price: 4.00, category: 'drinks', emoji: '🧃' },
  { id: 'soda',    name: 'Soda',         price: 2.00, category: 'drinks', emoji: '🥤' },
  { id: 'water',   name: 'Water',        price: 1.00, category: 'drinks', emoji: '💧' },

  // ── Food ────────────────────────────────────────────
  { id: 'sandwich', name: 'Sandwich',    price: 6.50, category: 'food', emoji: '🥪' },
  { id: 'pizza',    name: 'Pizza Slice', price: 4.50, category: 'food', emoji: '🍕' },
  { id: 'salad',    name: 'Salad',       price: 5.50, category: 'food', emoji: '🥗' },
  { id: 'burger',   name: 'Burger',      price: 7.00, category: 'food', emoji: '🍔' },

  // ── Snacks ──────────────────────────────────────────
  { id: 'chips',   name: 'Chips',      price: 2.00, category: 'snacks', emoji: '🍟' },
  { id: 'cookies', name: 'Cookies',    price: 2.50, category: 'snacks', emoji: '🍪' },
  { id: 'nuts',    name: 'Mixed Nuts', price: 3.00, category: 'snacks', emoji: '🥜' },
  { id: 'candy',   name: 'Candy Bar',  price: 1.75, category: 'snacks', emoji: '🍫' },

  // ── Merch ───────────────────────────────────────────
  { id: 'tshirt',  name: 'T-Shirt',      price: 15.00, category: 'merch', emoji: '👕' },
  { id: 'mug',     name: 'Mug',          price: 10.00, category: 'merch', emoji: '☕' },
  { id: 'sticker', name: 'Sticker Pack', price: 4.00,  category: 'merch', emoji: '🌟' },
];

export const CATEGORIES = ['All', 'Drinks', 'Food', 'Snacks', 'Merch'] as const;

export const TAX_RATE = 0.08;

/** Format a dollar amount (stored as a float) to $X.XX. */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ── Cart helpers ──────────────────────────────────────

export function calcSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calcFoodSubtotal(cart: CartItem[]): number {
  return cart
    .filter((item) => item.product.category === 'food')
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calcTax(subtotal: number, rate: number = TAX_RATE): number {
  return subtotal * rate;
}

export function calcItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
