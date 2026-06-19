import { useState, useMemo } from 'react';
import type { Order, CustomerType } from '../data/products';
import { formatCurrency, TAX_RATE } from '../data/products';
import {
  type ReportPeriod,
  PERIODS,
  formatDate,
  toTime,
  isToday,
  paymentLabel,
  customerTypeLabel,
  demographicLabel,
  CATEGORY_EMOJIS,
  CATEGORY_LABELS,
  useReportData,
} from '../data/reports';
import './ReportsPanel.css';

/* ── Component ───────────────────────────────────────────── */

interface ReportsPanelProps {
  orders: Order[];
}

function ReportsPanel({ orders }: ReportsPanelProps) {
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>('today');

  /* ── All report data computed by the shared data module ── */
  const { orderMetrics: metrics, customerMetrics, catalogStats, dailySales: dailySalesData } =
    useReportData(orders, activePeriod);

  const dailySalesTotal = dailySalesData?.total ?? 0;

  /* ── All-time order aggregates for income reconciliation ── */
  const allTimeMetrics = useMemo(() => {
    const todayFilter = isToday;
    const todayOrders = orders.filter((o) => todayFilter(o.createdAt));
    return { todayOrderRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0), todayOrderCount: todayOrders.length };
  }, [orders]);

  /* ── Max values for percentage bars ────────────────── */
  const maxPaymentRevenue = Math.max(1, ...Object.values(metrics.byPayment));
  const maxCategoryRevenue = Math.max(1, ...Object.values(metrics.byCategory));
  const maxProductRevenue = metrics.topByRevenue[0]?.revenue ?? 1;
  const maxCustomerSpent = customerMetrics.topCustomers[0]?.totalSpent ?? 1;
  const maxDemographicSpent = Math.max(1, ...Object.values(customerMetrics.byDemographic).map((d) => d.spent));
  const maxHourRevenue = Math.max(1, ...Object.values(metrics.byHour).map((h) => h.revenue));
  const peakHour = Object.entries(metrics.byHour).sort(([, a], [, b]) => b.orders - a.orders)[0];

  return (
    <div className="reports-panel">
      {/* ── Header ────────────────────────────────────── */}
      <header className="reports-header">
        <div className="reports-header-left">
          <h2>Income &amp; Reports</h2>
          <p className="reports-subtitle">
            Revenue, orders, customers, and catalog analytics — all in one view.
          </p>
        </div>
      </header>

      {/* ── Period tabs ────────────────────────────────── */}
      <nav className="reports-periods" role="tablist" aria-label="Report period">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            role="tab"
            aria-selected={activePeriod === p.value}
            className={`reports-period-tab ${activePeriod === p.value ? 'active' : ''}`}
            onClick={() => setActivePeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* ── Income KPI Cards ────────────────────────────── */}
      <section className="reports-section">
        <h3 className="reports-section-title">
          💰 Income Summary
        </h3>
        <div className="reports-kpis">
          <div className="reports-kpi-card reports-kpi-card--highlight">
            <span className="reports-kpi-icon" aria-hidden="true">💵</span>
            <span className="reports-kpi-label">Today's POS Income</span>
            <span className="reports-kpi-value">{formatCurrency(dailySalesTotal)}</span>
            <span className="reports-kpi-source">from POS top-bar tracker</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">🧾</span>
            <span className="reports-kpi-label">Order-Based Revenue</span>
            <span className="reports-kpi-value">{formatCurrency(metrics.totalRevenue)}</span>
            <span className="reports-kpi-source">{activePeriod} orders</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">📋</span>
            <span className="reports-kpi-label">Order Count</span>
            <span className="reports-kpi-value">{metrics.orderCount}</span>
            <span className="reports-kpi-source">{activePeriod}</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">📊</span>
            <span className="reports-kpi-label">Avg. Order Value</span>
            <span className="reports-kpi-value">{formatCurrency(metrics.avgOrderValue)}</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">📦</span>
            <span className="reports-kpi-label">Items Sold</span>
            <span className="reports-kpi-value">{metrics.totalItems}</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">💸</span>
            <span className="reports-kpi-label">Tax Collected</span>
            <span className="reports-kpi-value">{formatCurrency(metrics.totalTax)}</span>
            <span className="reports-kpi-source">{(TAX_RATE * 100).toFixed(0)}% rate</span>
          </div>
        </div>
      </section>

      {/* ── Income Reconciliation (Today) ───────────────── */}
      {activePeriod === 'today' && (
        <section className="reports-card reports-reconciliation">
          <h3 className="reports-card-title">🔗 Income Reconciliation — Today</h3>
          <div className="reports-recon-grid">
            <div className="reports-recon-item">
              <span className="reports-recon-label">POS Tracker</span>
              <span className="reports-recon-value">{formatCurrency(dailySalesTotal)}</span>
            </div>
            <div className="reports-recon-item">
              <span className="reports-recon-label">Order Sum</span>
              <span className="reports-recon-value">{formatCurrency(allTimeMetrics.todayOrderRevenue)}</span>
            </div>
            <div className="reports-recon-item">
              <span className="reports-recon-label">Difference</span>
              <span className={`reports-recon-value ${dailySalesTotal !== allTimeMetrics.todayOrderRevenue ? 'reports-recon-diff' : 'reports-recon-match'}`}>
                {formatCurrency(Math.abs(dailySalesTotal - allTimeMetrics.todayOrderRevenue))}
                {dailySalesTotal !== allTimeMetrics.todayOrderRevenue ? ' ⚠️' : ' ✅'}
              </span>
            </div>
          </div>
          {dailySalesTotal !== allTimeMetrics.todayOrderRevenue && (
            <p className="reports-recon-note">
              The POS tracker includes manual orders and adjustments. {allTimeMetrics.todayOrderCount} orders in the system today.
            </p>
          )}
        </section>
      )}

      {/* ── Revenue breakdown grid ─────────────────────── */}
      <div className="reports-grid">
        {/* Payment method */}
        <section className="reports-card">
          <h3 className="reports-card-title">Revenue by Payment Method</h3>
          {Object.keys(metrics.byPayment).length === 0 ? (
            <div className="reports-empty-inline">No data for this period.</div>
          ) : (
            <div className="reports-bar-list">
              {Object.entries(metrics.byPayment)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => (
                  <div key={method} className="reports-bar-item">
                    <div className="reports-bar-label">
                      <span>{paymentLabel(method)}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                    <div className="reports-bar-track">
                      <div
                        className="reports-bar-fill"
                        style={{ width: `${(amount / maxPaymentRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Category breakdown */}
        <section className="reports-card">
          <h3 className="reports-card-title">Revenue by Category</h3>
          {Object.keys(metrics.byCategory).length === 0 ? (
            <div className="reports-empty-inline">No data for this period.</div>
          ) : (
            <div className="reports-bar-list">
              {Object.entries(metrics.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="reports-bar-item">
                    <div className="reports-bar-label">
                      <span>
                        <span aria-hidden="true">{CATEGORY_EMOJIS[cat] ?? '📦'} </span>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                    <div className="reports-bar-track">
                      <div
                        className="reports-bar-fill reports-bar-fill--category"
                        style={{ width: `${(amount / maxCategoryRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Customer type */}
        <section className="reports-card">
          <h3 className="reports-card-title">Revenue by Customer Type</h3>
          {Object.keys(metrics.byCustomerType).length === 0 ? (
            <div className="reports-empty-inline">No data for this period.</div>
          ) : (
            <div className="reports-bar-list">
              {Object.entries(metrics.byCustomerType)
                .sort(([, a], [, b]) => b - a)
                .map(([ct, amount]) => (
                  <div key={ct} className="reports-bar-item">
                    <div className="reports-bar-label">
                      <span>{ct === 'walk-in' ? '🚶 Walk-in' : customerTypeLabel(ct as CustomerType)}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                    <div className="reports-bar-track">
                      <div
                        className="reports-bar-fill reports-bar-fill--customer-type"
                        style={{ width: `${(amount / maxPaymentRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Revenue composition */}
        <section className="reports-card">
          <h3 className="reports-card-title">Revenue Composition</h3>
          <div className="reports-composition">
            <div className="reports-comp-row">
              <span className="reports-comp-label">Subtotal (pre-tax)</span>
              <span className="reports-comp-value">{formatCurrency(metrics.totalSubtotal)}</span>
            </div>
            <div className="reports-comp-row">
              <span className="reports-comp-label">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span className="reports-comp-value">{formatCurrency(metrics.totalTax)}</span>
            </div>
            <div className="reports-comp-row reports-comp-total">
              <span className="reports-comp-label">Gross Revenue</span>
              <span className="reports-comp-value">{formatCurrency(metrics.totalRevenue)}</span>
            </div>
            {metrics.orderCount > 0 && (
              <>
                <div className="reports-comp-divider" />
                <div className="reports-comp-row">
                  <span className="reports-comp-label">Avg. Items per Order</span>
                  <span className="reports-comp-value">
                    {(metrics.totalItems / metrics.orderCount).toFixed(1)}
                  </span>
                </div>
                <div className="reports-comp-row">
                  <span className="reports-comp-label">Avg. Revenue per Item</span>
                  <span className="reports-comp-value">
                    {metrics.totalItems > 0
                      ? formatCurrency(metrics.totalRevenue / metrics.totalItems)
                      : '$0.00'}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* ── Hourly heat map ─────────────────────────────── */}
      <section className="reports-card">
        <h3 className="reports-card-title">⏰ Orders by Hour of Day</h3>
        {Object.keys(metrics.byHour).length === 0 ? (
          <div className="reports-empty-inline">No data for this period.</div>
        ) : (
          <>
            <div className="reports-hour-grid">
              {Array.from({ length: 24 }, (_, hour) => {
                const data = metrics.byHour[hour];
                const hh = String(hour).padStart(2, '0');
                return (
                  <div key={hour} className={`reports-hour-cell ${data ? 'active' : ''} ${peakHour && Number(peakHour[0]) === hour ? 'peak' : ''}`}>
                    <span className="reports-hour-time">{hh}:00</span>
                    <div className="reports-hour-bar-wrap">
                      <div
                        className="reports-hour-bar"
                        style={{
                          height: data ? `${Math.max(4, (data.revenue / maxHourRevenue) * 100)}%` : '0%',
                        }}
                      />
                    </div>
                    <span className="reports-hour-label">
                      {data ? `${data.orders} ord` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            {peakHour && (
              <p className="reports-hour-peak">
                🕐 Peak: <strong>{String(Number(peakHour[0])).padStart(2, '0')}:00</strong> with {peakHour[1].orders} order{peakHour[1].orders !== 1 ? 's' : ''} ({formatCurrency(peakHour[1].revenue)})
              </p>
            )}
          </>
        )}
      </section>

      {/* ── Top products ───────────────────────────────── */}
      <div className="reports-grid">
        <section className="reports-card">
          <h3 className="reports-card-title">🏆 Top Products by Revenue</h3>
          {metrics.topByRevenue.length === 0 ? (
            <div className="reports-empty-inline">No sales data for this period.</div>
          ) : (
            <div className="reports-bar-list">
              {metrics.topByRevenue.map((p) => (
                <div key={p.name} className="reports-bar-item">
                  <div className="reports-bar-label">
                    <span>
                      <span aria-hidden="true">{p.emoji} </span>
                      {p.name}
                    </span>
                    <span>{formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="reports-bar-track">
                    <div
                      className="reports-bar-fill reports-bar-fill--product"
                      style={{ width: `${(p.revenue / maxProductRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="reports-card">
          <h3 className="reports-card-title">📦 Top Products by Quantity</h3>
          {metrics.topByQuantity.length === 0 ? (
            <div className="reports-empty-inline">No sales data for this period.</div>
          ) : (
            <div className="reports-bar-list">
              {metrics.topByQuantity.map((p) => {
                const maxQty = metrics.topByQuantity[0]?.qty ?? 1;
                return (
                  <div key={p.name} className="reports-bar-item">
                    <div className="reports-bar-label">
                      <span>
                        <span aria-hidden="true">{p.emoji} </span>
                        {p.name}
                      </span>
                      <span>{p.qty} sold</span>
                    </div>
                    <div className="reports-bar-track">
                      <div
                        className="reports-bar-fill reports-bar-fill--qty"
                        style={{ width: `${(p.qty / maxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Product Catalog Summary ─────────────────────── */}
      <section className="reports-card">
        <h3 className="reports-card-title">📦 Product Catalog — {catalogStats.totalProducts} Products</h3>
        <div className="reports-catalog-grid">
          {Object.entries(catalogStats.byCategory)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([cat, stats]) => (
              <div key={cat} className="reports-catalog-item">
                <span className="reports-catalog-emoji" aria-hidden="true">
                  {CATEGORY_EMOJIS[cat] ?? '📦'}
                </span>
                <div className="reports-catalog-info">
                  <span className="reports-catalog-name">{CATEGORY_LABELS[cat] ?? cat}</span>
                  <span className="reports-catalog-detail">
                    {stats.count} products · {formatCurrency(stats.minPrice)}–{formatCurrency(stats.maxPrice)}
                  </span>
                </div>
                <span className="reports-catalog-total">
                  avg {formatCurrency(stats.total / stats.count)}
                </span>
              </div>
            ))}
        </div>
      </section>

      {/* ── Customer Revenue ───────────────────────────── */}
      <section className="reports-section">
        <h3 className="reports-section-title">👥 Customer Revenue (All-Time)</h3>
        <div className="reports-kpis">
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">👥</span>
            <span className="reports-kpi-label">Total Customers</span>
            <span className="reports-kpi-value">{customerMetrics.totalCustomers}</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">💰</span>
            <span className="reports-kpi-label">Total Customer Spend</span>
            <span className="reports-kpi-value">{formatCurrency(customerMetrics.totalCustomerSpent)}</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">🔄</span>
            <span className="reports-kpi-label">Total Visits</span>
            <span className="reports-kpi-value">{customerMetrics.totalCustomerVisits}</span>
          </div>
          <div className="reports-kpi-card">
            <span className="reports-kpi-icon" aria-hidden="true">📊</span>
            <span className="reports-kpi-label">Avg. Spend / Visit</span>
            <span className="reports-kpi-value">{formatCurrency(customerMetrics.avgPerVisit)}</span>
          </div>
        </div>
      </section>

      {/* ── Demographic + Top Customers ────────────────── */}
      <div className="reports-grid">
        <section className="reports-card">
          <h3 className="reports-card-title">Spend by Demographic</h3>
          <div className="reports-bar-list">
            {Object.entries(customerMetrics.byDemographic)
              .sort(([, a], [, b]) => b.spent - a.spent)
              .map(([demo, data]) => (
                <div key={demo} className="reports-bar-item">
                  <div className="reports-bar-label">
                    <span>
                      <span aria-hidden="true">{data.emoji} </span>
                      {demo.charAt(0).toUpperCase() + demo.slice(1)}
                      <span className="reports-bar-meta"> ({data.count} customers)</span>
                    </span>
                    <span>{formatCurrency(data.spent)}</span>
                  </div>
                  <div className="reports-bar-track">
                    <div
                      className="reports-bar-fill reports-bar-fill--demographic"
                      style={{ width: `${(data.spent / maxDemographicSpent) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="reports-card">
          <h3 className="reports-card-title">🏅 Top Customers by Spend</h3>
          <div className="reports-bar-list">
            {customerMetrics.topCustomers.map((cust) => (
              <div key={cust.id} className="reports-bar-item">
                <div className="reports-bar-label">
                  <span>
                    <span aria-hidden="true">{cust.emoji} </span>
                    {cust.name}
                    <span className="reports-bar-meta"> · {cust.visits} visits</span>
                  </span>
                  <span>{formatCurrency(cust.totalSpent)}</span>
                </div>
                <div className="reports-bar-track">
                  <div
                    className="reports-bar-fill reports-bar-fill--customer"
                    style={{ width: `${(cust.totalSpent / maxCustomerSpent) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Orders table ───────────────────────────────── */}
      <section className="reports-section">
        <h3 className="reports-section-title">
          {activePeriod === 'all' ? 'All' : activePeriod === 'today' ? "Today's" : activePeriod === 'yesterday' ? "Yesterday's" : 'Period'} Orders
          <span className="reports-section-count">
            {metrics.orderCount} order{metrics.orderCount !== 1 ? 's' : ''}
          </span>
        </h3>
        {metrics.orderCount === 0 ? (
          <div className="reports-empty">
            <span className="reports-empty-icon" aria-hidden="true">📋</span>
            <p>No orders in this period.</p>
          </div>
        ) : (
          <div className="reports-orders-table-wrap">
            <table className="reports-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Segment</th>
                </tr>
              </thead>
              <tbody>
                {metrics.orders.slice(0, 50).map((order) => (
                  <tr key={order.id}>
                    <td className="reports-order-id">{order.id}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="reports-mono">{toTime(order.createdAt)}</td>
                    <td className="reports-order-items">
                      {order.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="reports-mono">{formatCurrency(order.subtotal)}</td>
                    <td className="reports-mono">{formatCurrency(order.tax)}</td>
                    <td className="reports-mono reports-total-cell">
                      {formatCurrency(order.total)}
                    </td>
                    <td>{paymentLabel(order.paymentMethod)}</td>
                    <td>{order.customerType ? customerTypeLabel(order.customerType) : '—'}</td>
                    <td>{order.customerName || '—'}</td>
                    <td>{order.customerDemographic ? demographicLabel(order.customerDemographic) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {metrics.orderCount > 50 && (
              <p className="reports-table-note">
                Showing 50 of {metrics.orderCount} orders.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default ReportsPanel;
