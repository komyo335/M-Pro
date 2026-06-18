/**
 * Customer database — single source of truth for customer profiles.
 * Each customer has a demographic segment used for filtering and analytics.
 * Customer stats are persisted to localStorage and updated when orders complete.
 */

import type { CustomerDemographic } from './products';
import { DEMOGRAPHICS } from './products';
import type { Order } from './products';

export type { CustomerDemographic };
export { DEMOGRAPHICS };

export interface Customer {
  id: string;
  name: string;
  demographic: CustomerDemographic;
  visits: number;
  totalSpent: number;
  lastVisit: string; // ISO date string (YYYY-MM-DD)
  favoriteItem: string;
  emoji: string;
}

const CUSTOMERS_KEY = 'mpro_customers';

/** Default seed data — used on first load when no localStorage data exists. */
const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1',  name: 'Liam',      demographic: 'boy',      visits: 12, totalSpent: 48.50,  lastVisit: '2026-06-17', favoriteItem: 'Hot Chocolate', emoji: '👦' },
  { id: 'c2',  name: 'Noah',      demographic: 'boy',      visits: 8,  totalSpent: 32.00,  lastVisit: '2026-06-16', favoriteItem: 'Pizza Slice',   emoji: '👦' },
  { id: 'c3',  name: 'Emma',      demographic: 'girl',     visits: 15, totalSpent: 56.75,  lastVisit: '2026-06-18', favoriteItem: 'Smoothie',      emoji: '👧' },
  { id: 'c4',  name: 'Olivia',    demographic: 'girl',     visits: 10, totalSpent: 41.25,  lastVisit: '2026-06-15', favoriteItem: 'Muffin',        emoji: '👧' },
  { id: 'c5',  name: 'Ethan',     demographic: 'children', visits: 6,  totalSpent: 22.50,  lastVisit: '2026-06-14', favoriteItem: 'Candy Bar',     emoji: '🧒' },
  { id: 'c6',  name: 'Sophia',    demographic: 'children', visits: 9,  totalSpent: 30.00,  lastVisit: '2026-06-17', favoriteItem: 'Cookies',       emoji: '🧒' },
  { id: 'c7',  name: 'James',     demographic: 'men',      visits: 20, totalSpent: 96.00,  lastVisit: '2026-06-18', favoriteItem: 'Coffee',        emoji: '👨' },
  { id: 'c8',  name: 'Michael',   demographic: 'men',      visits: 18, totalSpent: 87.50,  lastVisit: '2026-06-17', favoriteItem: 'Burger',        emoji: '👨' },
  { id: 'c9',  name: 'William',   demographic: 'men',      visits: 14, totalSpent: 63.00,  lastVisit: '2026-06-16', favoriteItem: 'Iced Latte',    emoji: '👨' },
  { id: 'c10', name: 'Charlotte', demographic: 'women',    visits: 22, totalSpent: 104.50, lastVisit: '2026-06-18', favoriteItem: 'Tea',           emoji: '👩' },
  { id: 'c11', name: 'Amelia',    demographic: 'women',    visits: 16, totalSpent: 71.00,  lastVisit: '2026-06-17', favoriteItem: 'Salad',         emoji: '👩' },
  { id: 'c12', name: 'Harper',    demographic: 'women',    visits: 11, totalSpent: 52.25,  lastVisit: '2026-06-15', favoriteItem: 'Lemonade',      emoji: '👩' },
];

/** Load customers from localStorage, falling back to seed data. */
export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return SEED_CUSTOMERS.map((c) => ({ ...c }));
    return JSON.parse(raw);
  } catch {
    return SEED_CUSTOMERS.map((c) => ({ ...c }));
  }
}

/** Persist the full customer array to localStorage. */
export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/** Get today's date as YYYY-MM-DD. */
function getTodayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * When an order completes, update the matching customer's stats.
 * Matches by customerId if present, otherwise by customerName (case-insensitive).
 * If no match is found, a new customer is created from the order data.
 */
export function updateCustomerFromOrder(order: Order): Customer | null {
  const customers = loadCustomers();
  const today = getTodayKey();

  let customer: Customer | undefined;

  // Try to find by customerId first
  if (order.customerId) {
    customer = customers.find((c) => c.id === order.customerId);
  }

  // Fall back to match by name (case-insensitive)
  if (!customer && order.customerName) {
    const name = order.customerName.trim().toLowerCase();
    customer = customers.find((c) => c.name.toLowerCase() === name);
  }

  if (customer) {
    // Update existing customer
    customer.visits += 1;
    customer.totalSpent += order.total;
    customer.lastVisit = today;
    // Determine favorite item from this order
    const topItem = order.items.reduce((best, item) =>
      item.quantity > best.quantity ? item : best,
      order.items[0],
    );
    if (topItem) {
      customer.favoriteItem = topItem.product.name;
    }
    saveCustomers(customers);
    return customer;
  }

  // No match — create a new customer from the order data
  if (order.customerName && order.customerDemographic) {
    const demo = order.customerDemographic;
    const demoInfo = DEMOGRAPHICS.find((d) => d.value === demo);
    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: order.customerName.trim(),
      demographic: demo,
      visits: 1,
      totalSpent: order.total,
      lastVisit: today,
      favoriteItem: order.items[0]?.product.name ?? 'Unknown',
      emoji: demoInfo?.icon ?? '👤',
    };
    customers.push(newCustomer);
    saveCustomers(customers);
    return newCustomer;
  }

  return null;
}

export function getCustomerCountByDemographic(demographic: CustomerDemographic): number {
  return loadCustomers().filter((c) => c.demographic === demographic).length;
}

export function getTotalSpentByDemographic(demographic: CustomerDemographic): number {
  return loadCustomers()
    .filter((c) => c.demographic === demographic)
    .reduce((sum, c) => sum + c.totalSpent, 0);
}
