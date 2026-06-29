import { useState, useMemo, useEffect } from 'react';
// import type { CustomerDemographic } from '../data/customers';
import type { Customer } from '../data/customers';
import { loadCustomers, DEMOGRAPHICS } from '../data/customers';
import { formatCurrency } from '../data/products';
import './CustomerManagement.css';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);
  const [activeDemographic, setActiveDemographic] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Reload customers from localStorage whenever the panel opens
  useEffect(() => {
    setCustomers(loadCustomers());
  }, []);

  const filteredCustomers = useMemo(() => {
    if (activeDemographic === 'all') return customers;
    return customers.filter((c) => c.demographic === activeDemographic);
  }, [activeDemographic, customers]);

  const activeCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomer) ?? null,
    [selectedCustomer, customers],
  );

  const demographicCounts = useMemo(() => {
    const counts: Record<string, number> = { all: customers.length };
    for (const demo of DEMOGRAPHICS) {
      if (demo.value !== 'all') {
        counts[demo.value] = customers.filter((c) => c.demographic === demo.value).length;
      }
    }
    return counts;
  }, [customers]);

  return (
    <div className="customer-mgmt">
      {/* ── Header ────────────────────────────────────── */}
      <header className="customer-header">
        <h2>Customers</h2>
        <p className="customer-subtitle">
          Manage customer profiles and view visit history by demographic segment.
        </p>
      </header>

      {/* ── Demographic Tabs ──────────────────────────── */}
      <nav className="customer-tabs" role="tablist" aria-label="Customer demographics">
        {DEMOGRAPHICS.map((demo) => (
          <button
            key={demo.value}
            role="tab"
            aria-selected={activeDemographic === demo.value}
            className={`customer-tab ${activeDemographic === demo.value ? 'active' : ''}`}
            onClick={() => {
              setActiveDemographic(demo.value);
              setSelectedCustomer(null);
            }}
          >
            <span className="customer-tab-icon" aria-hidden="true">{demo.icon}</span>
            <span className="customer-tab-label">{demo.label}</span>
            <span className="customer-tab-count">{demographicCounts[demo.value]}</span>
          </button>
        ))}
      </nav>

      {/* ── Content area ──────────────────────────────── */}
      <div className="customer-content">
        {/* Customer list */}
        <section className="customer-list">
          {filteredCustomers.length === 0 ? (
            <div className="customer-empty">
              <span className="customer-empty-icon" aria-hidden="true">🔍</span>
              <p>No customers in this segment.</p>
            </div>
          ) : (
            <div className="customer-grid">
              {filteredCustomers.map((cust) => (
                <button
                  key={cust.id}
                  className={`customer-card ${selectedCustomer === cust.id ? 'selected' : ''}`}
                  onClick={() =>
                    setSelectedCustomer(selectedCustomer === cust.id ? null : cust.id)
                  }
                >
                  <span className="customer-card-emoji" aria-hidden="true">
                    {cust.emoji}
                  </span>
                  <span className="customer-card-name">{cust.name}</span>
                  <span className="customer-card-visits">
                    {cust.visits} visit{cust.visits !== 1 ? 's' : ''}
                  </span>
                  <span className="customer-card-total">
                    {formatCurrency(cust.totalSpent)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Customer detail panel */}
        {activeCustomer && (
          <aside className="customer-detail">
            <div className="customer-detail-header">
              <span className="customer-detail-emoji" aria-hidden="true">
                {activeCustomer.emoji}
              </span>
              <h3>{activeCustomer.name}</h3>
              <button
                className="customer-detail-close"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close customer detail"
              >
                ×
              </button>
            </div>

            <div className="customer-detail-body">
              <div className="customer-detail-row">
                <span className="customer-detail-label">Segment</span>
                <span className="customer-detail-value customer-segment">
                  {DEMOGRAPHICS.find((d) => d.value === activeCustomer.demographic)?.icon}{' '}
                  {activeCustomer.demographic.charAt(0).toUpperCase() + activeCustomer.demographic.slice(1)}
                </span>
              </div>
              <div className="customer-detail-row">
                <span className="customer-detail-label">Total Visits</span>
                <span className="customer-detail-value">{activeCustomer.visits}</span>
              </div>
              <div className="customer-detail-row">
                <span className="customer-detail-label">Total Spent</span>
                <span className="customer-detail-value">
                  {formatCurrency(activeCustomer.totalSpent)}
                </span>
              </div>
              <div className="customer-detail-row">
                <span className="customer-detail-label">Avg. per Visit</span>
                <span className="customer-detail-value">
                  {formatCurrency(activeCustomer.totalSpent / activeCustomer.visits)}
                </span>
              </div>
              <div className="customer-detail-row">
                <span className="customer-detail-label">Last Visit</span>
                <span className="customer-detail-value">
                  {formatDate(activeCustomer.lastVisit)}
                </span>
              </div>
              <div className="customer-detail-row">
                <span className="customer-detail-label">Favorite Item</span>
                <span className="customer-detail-value">{activeCustomer.favoriteItem}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default CustomerManagement;
