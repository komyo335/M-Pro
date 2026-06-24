/**
 * Reports data module — single source of truth for report metrics computation.
 * Extracts all data aggregation, filtering, and metrics logic from ReportsPanel
 * so the component focuses purely on presentation.
 *
 * Follows the same pattern as customers.ts, products.ts, and staff.ts.
 */

import { useMemo } from 'react';
import type { Order, CustomerType, CustomerDemographic } from './products';
import { PRODUCTS, CUSTOMER_TYPES } from './products';
import { loadCustomers, DEMOGRAPHICS } from './customers';

/* ── Types ───────────────────────────────────────────────── */

export type ReportPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'all';

export interface OrderMetrics {
  orders: Order[];
  totalRevenue: number;
  totalTax: number;
  totalSubtotal: number;
  orderCount: number;
  avgOrderValue: number;
  totalItems: number;
  byPayment: Record<string, number>;
  byCategory: Record<string, number>;
  byCustomerType: Record<string, number>;
  topByRevenue: { revenue: number; qty: number; name: string; emoji: string }[];
  topByQuantity: { revenue: number; qty: number; name: string; emoji: string }[];
  byHour: Record<number, { orders: number; revenue: number }>;
}

export interface CustomerMetrics {
  totalCustomers: number;
  totalCustomerSpent: number;
  totalCustomerVisits: number;
  avgPerVisit: number;
  byDemographic: Record<string, { spent: number; visits: number; count: number; emoji: string }>;
  topCustomers: ReturnType<typeof loadCustomers>;
}

export interface CatalogStats {
  totalProducts: number;
  byCategory: Record<string, { count: number; minPrice: number; maxPrice: number; total: number }>;
}

export interface DailySalesData {
  date: string;
  total: number;
}

export interface ReportData {
  orderMetrics: OrderMetrics;
  customerMetrics: CustomerMetrics;
  catalogStats: CatalogStats;
  dailySales: DailySalesData | null;
}

/* ── Period definitions ─────────────────────────────────── */

export const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

/* ── Date helpers ────────────────────────────────────────── */

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function toTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === getTodayKey();
}

export function isYesterday(iso: string): boolean {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return iso.slice(0, 10) === yKey;
}

export function isThisWeek(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

export function isThisMonth(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function periodFilter(period: ReportPeriod): (iso: string) => boolean {
  switch (period) {
    case 'today': return isToday;
    case 'yesterday': return isYesterday;
    case 'week': return isThisWeek;
    case 'month': return isThisMonth;
    default: return () => true;
  }
}

/* ── Display label maps ─────────────────────────────────── */

export const CATEGORY_LABELS: Record<string, string> = {
  drinks: 'Drinks',
  food: 'Food',
  snacks: 'Snacks',
  merch: 'Merch',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  drinks: '🥤',
  food: '🍽️',
  snacks: '🍪',
  merch: '👕',
};

export function paymentLabel(method: string): string {
  switch (method) {
    case 'cash': return 'Cash';
    case 'card': return 'Card';
    case 'mobile': return 'Mobile Pay';
    case 'manual': return 'Manual';
    default: return method;
  }
}

export function customerTypeLabel(type: CustomerType | undefined): string {
  const found = CUSTOMER_TYPES.find((ct) => ct.value === type);
  return found ? `${found.emoji} ${found.label}` : '';
}

export function demographicLabel(demo: CustomerDemographic | undefined): string {
  if (!demo) return '';
  const found = DEMOGRAPHICS.find((d) => d.value === demo);
  return found ? `${found.icon} ${found.label}` : '';
}

/* ── Daily sales persistence (shared key with POSDashboard) ── */

export const SALES_KEY = 'mpro_daily_sales';

export function loadDailySales(): DailySalesData | null {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data;
  } catch {
    return null;
  }
}

/* ── Pure metric computation functions ──────────────────── */

/**
 * Compute all order-based metrics for a given period.
 * Pure function — no side effects, no localStorage access.
 */
export function computeOrderMetrics(orders: Order[], period: ReportPeriod): OrderMetrics {
  const filter = periodFilter(period);
  const ords = orders.filter((o) => filter(o.createdAt));

  const totalRevenue = ords.reduce((sum, o) => sum + o.total, 0);
  const totalTax = ords.reduce((sum, o) => sum + o.tax, 0);
  const totalSubtotal = ords.reduce((sum, o) => sum + o.subtotal, 0);
  const orderCount = ords.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const totalItems = ords.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  // Revenue by payment method
  const byPayment: Record<string, number> = {};
  for (const o of ords) {
    const key = o.paymentMethod || 'unknown';
    byPayment[key] = (byPayment[key] || 0) + o.total;
  }

  // Revenue by product category
  const byCategory: Record<string, number> = {};
  for (const o of ords) {
    for (const item of o.items) {
      const cat = item.product.category;
      byCategory[cat] = (byCategory[cat] || 0) + item.product.price * item.quantity;
    }
  }

  // Revenue by customer type
  const byCustomerType: Record<string, number> = {};
  for (const o of ords) {
    const ct = o.customerType || 'walk-in';
    byCustomerType[ct] = (byCustomerType[ct] || 0) + o.total;
  }

  // Top products by revenue + quantity
  const productRevenue: Record<string, { revenue: number; qty: number; name: string; emoji: string }> = {};
  for (const o of ords) {
    for (const item of o.items) {
      const pid = item.product.id;
      if (!productRevenue[pid]) {
        productRevenue[pid] = {
          revenue: 0,
          qty: 0,
          name: item.product.name,
          emoji: item.product.emoji,
        };
      }
      productRevenue[pid].revenue += item.product.price * item.quantity;
      productRevenue[pid].qty += item.quantity;
    }
  }
  const topByRevenue = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  const topByQuantity = Object.values(productRevenue)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // Time-of-day heat: group by hour
  const byHour: Record<number, { orders: number; revenue: number }> = {};
  for (const o of ords) {
    const hour = new Date(o.createdAt).getHours();
    if (!byHour[hour]) byHour[hour] = { orders: 0, revenue: 0 };
    byHour[hour].orders += 1;
    byHour[hour].revenue += o.total;
  }

  return {
    orders: ords,
    totalRevenue,
    totalTax,
    totalSubtotal,
    orderCount,
    avgOrderValue,
    totalItems,
    byPayment,
    byCategory,
    byCustomerType,
    topByRevenue,
    topByQuantity,
    byHour,
  };
}

/**
 * Compute all customer-based metrics (all-time, not period-filtered).
 * Pure function — calls loadCustomers() which reads localStorage.
 * Now also cross-references with order data for customerId linking.
 */
export function computeCustomerMetrics(orders?: Order[]): CustomerMetrics {
  const allCustomers = loadCustomers();
  const totalCustomers = allCustomers.length;
  const totalCustomerSpent = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalCustomerVisits = allCustomers.reduce((sum, c) => sum + c.visits, 0);
  const avgPerVisit = totalCustomerVisits > 0 ? totalCustomerSpent / totalCustomerVisits : 0;

  // Link orders to customers via customerId for enriched metrics
  const ordersByCustomerId: Record<string, Order[]> = {};
  if (orders) {
    for (const o of orders) {
      if (o.customerId) {
        if (!ordersByCustomerId[o.customerId]) ordersByCustomerId[o.customerId] = [];
        ordersByCustomerId[o.customerId].push(o);
      }
    }
  }

  const byDemographic: Record<string, { spent: number; visits: number; count: number; emoji: string }> = {};
  for (const demo of DEMOGRAPHICS) {
    if (demo.value !== 'all') {
      const customers = allCustomers.filter((c) => c.demographic === demo.value);
      byDemographic[demo.value] = {
        spent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        visits: customers.reduce((sum, c) => sum + c.visits, 0),
        count: customers.length,
        emoji: demo.icon,
      };
    }
  }

  const topCustomers = [...allCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  return { totalCustomers, totalCustomerSpent, totalCustomerVisits, avgPerVisit, byDemographic, topCustomers };
}

/**
 * Compute product catalog stats (static — PRODUCTS doesn't change at runtime).
 */
export function computeCatalogStats(): CatalogStats {
  const byCategory: Record<string, { count: number; minPrice: number; maxPrice: number; total: number }> = {};
  for (const p of PRODUCTS) {
    if (!byCategory[p.category]) {
      byCategory[p.category] = { count: 0, minPrice: Infinity, maxPrice: -Infinity, total: 0 };
    }
    const s = byCategory[p.category];
    s.count += 1;
    s.total += p.price;
    if (p.price < s.minPrice) s.minPrice = p.price;
    if (p.price > s.maxPrice) s.maxPrice = p.price;
  }
  return { totalProducts: PRODUCTS.length, byCategory };
}

/* ── Custom hook: useReportData ──────────────────────────── */

/**
 * React hook that memoizes all report data computations.
 * Uses useMemo for each computation so they only re-run when dependencies change.
 *
 * @param orders - The full order history (from POSDashboard state)
 * @param period - The active report period filter
 * @returns A ReportData object with all metrics, customer data, and catalog stats
 */
export function useReportData(orders: Order[], period: ReportPeriod): ReportData {
  const orderMetrics = useMemo(
    () => computeOrderMetrics(orders, period),
    [orders, period],
  );

  const customerMetrics = useMemo(
    () => computeCustomerMetrics(orders),
    // Customer data comes from localStorage — recompute only when orders change
    // (orders change when a new order is completed, which updates customer stats)
    [orders],
  );

  const catalogStats = useMemo(
    () => computeCatalogStats(),
    // Product catalog is static — compute once
    [],
  );

  const dailySales = useMemo(
    () => loadDailySales(),
    // Daily sales come from localStorage, recompute when orders change
    [orders],
  );

  return { orderMetrics, customerMetrics, catalogStats, dailySales };
}
