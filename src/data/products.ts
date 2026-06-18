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
  { id: 'coffee',       name: 'Coffee',       price: 3.50, category: 'drinks', emoji: '☕' },
  { id: 'tea',          name: 'Tea',          price: 2.75, category: 'drinks', emoji: '🍵' },
  { id: 'juice',        name: 'Orange Juice', price: 4.00, category: 'drinks', emoji: '🧃' },
  { id: 'soda',         name: 'Soda',         price: 2.00, category: 'drinks', emoji: '🥤' },
  { id: 'water',        name: 'Water',        price: 1.00, category: 'drinks', emoji: '💧' },
  { id: 'iced-latte',   name: 'Iced Latte',   price: 4.25, category: 'drinks', emoji: '🧋' },
  { id: 'smoothie',     name: 'Smoothie',     price: 5.50, category: 'drinks', emoji: '🥝' },
  { id: 'hot-chocolate',name: 'Hot Chocolate',price: 3.75, category: 'drinks', emoji: '🍶' },
  { id: 'lemonade',     name: 'Lemonade',     price: 3.00, category: 'drinks', emoji: '🍋' },

  // ── Food ────────────────────────────────────────────
  { id: 'sandwich', name: 'Sandwich',    price: 6.50, category: 'food', emoji: '🥪' },
  { id: 'pizza',    name: 'Pizza Slice', price: 4.50, category: 'food', emoji: '🍕' },
  { id: 'salad',    name: 'Salad',       price: 5.50, category: 'food', emoji: '🥗' },
  { id: 'burger',   name: 'Burger',      price: 7.00, category: 'food', emoji: '🍔' },
  { id: 'wrap',     name: 'Wrap',        price: 7.50, category: 'food', emoji: '🌯' },
  { id: 'soup',     name: 'Soup',        price: 4.50, category: 'food', emoji: '🍜' },
  { id: 'burrito',  name: 'Burrito',     price: 8.00, category: 'food', emoji: '🌮' },
  { id: 'pasta',    name: 'Pasta',       price: 6.50, category: 'food', emoji: '🍝' },

  // ── Snacks ──────────────────────────────────────────
  { id: 'chips',        name: 'Chips',        price: 2.00, category: 'snacks', emoji: '🍟' },
  { id: 'cookies',      name: 'Cookies',      price: 2.50, category: 'snacks', emoji: '🍪' },
  { id: 'nuts',         name: 'Mixed Nuts',   price: 3.00, category: 'snacks', emoji: '🥜' },
  { id: 'candy',        name: 'Candy Bar',    price: 1.75, category: 'snacks', emoji: '🍫' },
  { id: 'muffin',       name: 'Muffin',       price: 3.50, category: 'snacks', emoji: '🧁' },
  { id: 'brownie',      name: 'Brownie',      price: 3.00, category: 'snacks', emoji: '🍰' },
  { id: 'pretzel',      name: 'Pretzel',      price: 2.75, category: 'snacks', emoji: '🥨' },
  { id: 'granola-bar',  name: 'Granola Bar',  price: 2.25, category: 'snacks', emoji: '🍯' },

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

// ── Order types & persistence ──────────────────────

export type CustomerType = 'dine-in' | 'takeout' | 'delivery';

export const CUSTOMER_TYPES: { value: CustomerType; label: string; emoji: string }[] = [
  { value: 'dine-in', label: 'Dine-in', emoji: '🍽️' },
  { value: 'takeout', label: 'Takeout', emoji: '🥡' },
  { value: 'delivery', label: 'Delivery', emoji: '🛵' },
];

export type CustomerDemographic = 'boy' | 'girl' | 'children' | 'men' | 'women';

export const DEMOGRAPHICS: { value: CustomerDemographic | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '👥' },
  { value: 'boy', label: 'Boy', icon: '👦' },
  { value: 'girl', label: 'Girl', icon: '👧' },
  { value: 'children', label: 'Children', icon: '🧒' },
  { value: 'men', label: 'Men', icon: '👨' },
  { value: 'women', label: 'Women', icon: '👩' },
];

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdAt: string; // ISO 8601
  customerName?: string;
  customerType?: CustomerType;
  customerId?: string;
  customerDemographic?: CustomerDemographic;
}

const ORDERS_KEY = 'mpro_orders';

function generateOrderId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  const orders = loadOrders();
  orders.unshift(order);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function createOrder(
  cart: CartItem[],
  subtotal: number,
  tax: number,
  total: number,
  paymentMethod: string,
): Order {
  return {
    id: generateOrderId(),
    items: [...cart],
    subtotal,
    tax,
    total,
    paymentMethod,
    createdAt: new Date().toISOString(),
  };
}

export interface FormLineItem {
  key: string;       // unique React key
  productId: string;
  quantity: number;
  price: number;
}

let _lineKeyCounter = 0;
export function freshLineKey(): string {
  return `line-${Date.now()}-${++_lineKeyCounter}`;
}

export interface ManualOrderInput {
  items: FormLineItem[];
  customerName: string;
  customerType: CustomerType;
  customerDemographic: CustomerDemographic | '';
  time: string; // HH:MM in 24h
}

export function createManualOrder(input: ManualOrderInput): Order | null {
  const cartItems: CartItem[] = [];
  for (const li of input.items) {
    const product = findProduct(li.productId);
    if (!product) return null;
    cartItems.push({ product, quantity: li.quantity });
  }

  const subtotal = input.items.reduce((sum, li) => sum + li.price * li.quantity, 0);
  const tax = calcTax(subtotal);
  const total = subtotal + tax;

  // Merge the HH:MM time into today's date
  const [hours, minutes] = input.time.split(':').map(Number);
  const createdAt = new Date();
  createdAt.setHours(hours, minutes, 0, 0);

  return {
    id: generateOrderId(),
    items: cartItems,
    subtotal,
    tax,
    total,
    paymentMethod: 'manual',
    createdAt: createdAt.toISOString(),
    customerName: input.customerName,
    customerType: input.customerType,
    customerDemographic: input.customerDemographic || undefined,
  };
}
