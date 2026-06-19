import { useState, useMemo, useEffect } from 'react';
import type { StaffRole } from '../data/staff';
import type { StaffMember } from '../data/staff';
import { loadStaff, STAFF_ROLES, SHIFTS } from '../data/staff';
import './StaffManagement.css';

function formatHireDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function statusLabel(status: StaffMember['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'on-break': return 'On Break';
    case 'off': return 'Off Duty';
  }
}

function roleLabel(role: StaffRole): string {
  const found = STAFF_ROLES.find((r) => r.value === role);
  return found ? `${found.icon} ${found.label}` : role;
}

function shiftLabel(shift: StaffMember['shift']): string {
  const found = SHIFTS.find((s) => s.value === shift);
  return found ? `${found.icon} ${found.label}` : shift;
}

function shiftHours(shift: StaffMember['shift']): string {
  const found = SHIFTS.find((s) => s.value === shift);
  return found?.hours ?? '';
}

function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(loadStaff);
  const [activeRole, setActiveRole] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  // Reload staff from localStorage whenever the panel opens
  useEffect(() => {
    setStaff(loadStaff());
  }, []);

  const filteredStaff = useMemo(() => {
    if (activeRole === 'all') return staff;
    return staff.filter((s) => s.role === activeRole);
  }, [activeRole, staff]);

  const activeMember = useMemo(
    () => staff.find((s) => s.id === selectedStaff) ?? null,
    [selectedStaff, staff],
  );

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: staff.length };
    for (const role of STAFF_ROLES) {
      if (role.value !== 'all') {
        counts[role.value] = staff.filter((s) => s.role === role.value).length;
      }
    }
    return counts;
  }, [staff]);

  // Aggregate stats
  const stats = useMemo(() => {
    const activeCount = staff.filter((s) => s.status === 'active').length;
    const onBreakCount = staff.filter((s) => s.status === 'on-break').length;
    const offCount = staff.filter((s) => s.status === 'off').length;
    const totalOrdersHandled = staff.reduce((sum, s) => sum + s.ordersHandled, 0);
    return { activeCount, onBreakCount, offCount, totalOrdersHandled };
  }, [staff]);

  return (
    <div className="staff-mgmt">
      {/* ── Header ────────────────────────────────────── */}
      <header className="staff-header">
        <h2>Staff</h2>
        <p className="staff-subtitle">
          Manage employee profiles, shifts, and performance across your team.
        </p>
      </header>

      {/* ── Stats bar ─────────────────────────────────── */}
      <div className="staff-stats">
        <div className="staff-stat-card staff-stat--active">
          <span className="staff-stat-icon" aria-hidden="true">🟢</span>
          <span className="staff-stat-value">{stats.activeCount}</span>
          <span className="staff-stat-label">Active</span>
        </div>
        <div className="staff-stat-card staff-stat--break">
          <span className="staff-stat-icon" aria-hidden="true">🟡</span>
          <span className="staff-stat-value">{stats.onBreakCount}</span>
          <span className="staff-stat-label">On Break</span>
        </div>
        <div className="staff-stat-card staff-stat--off">
          <span className="staff-stat-icon" aria-hidden="true">⚪</span>
          <span className="staff-stat-value">{stats.offCount}</span>
          <span className="staff-stat-label">Off Duty</span>
        </div>
        <div className="staff-stat-card staff-stat--total">
          <span className="staff-stat-icon" aria-hidden="true">📋</span>
          <span className="staff-stat-value">{stats.totalOrdersHandled.toLocaleString()}</span>
          <span className="staff-stat-label">Orders Handled</span>
        </div>
      </div>

      {/* ── Role Tabs ─────────────────────────────────── */}
      <nav className="staff-tabs" role="tablist" aria-label="Staff roles">
        {STAFF_ROLES.map((role) => (
          <button
            key={role.value}
            role="tab"
            aria-selected={activeRole === role.value}
            className={`staff-tab ${activeRole === role.value ? 'active' : ''}`}
            onClick={() => {
              setActiveRole(role.value);
              setSelectedStaff(null);
            }}
          >
            <span className="staff-tab-icon" aria-hidden="true">{role.icon}</span>
            <span className="staff-tab-label">{role.label}</span>
            <span className="staff-tab-count">{roleCounts[role.value]}</span>
          </button>
        ))}
      </nav>

      {/* ── Content area ──────────────────────────────── */}
      <div className="staff-content">
        {/* Staff list */}
        <section className="staff-list">
          {filteredStaff.length === 0 ? (
            <div className="staff-empty">
              <span className="staff-empty-icon" aria-hidden="true">🔍</span>
              <p>No staff members in this role.</p>
            </div>
          ) : (
            <div className="staff-grid">
              {filteredStaff.map((member) => (
                <button
                  key={member.id}
                  className={`staff-card ${selectedStaff === member.id ? 'selected' : ''}`}
                  onClick={() =>
                    setSelectedStaff(selectedStaff === member.id ? null : member.id)
                  }
                >
                  <span className="staff-card-emoji" aria-hidden="true">
                    {member.emoji}
                  </span>
                  <span className="staff-card-name">{member.name}</span>
                  <span className="staff-card-role">{roleLabel(member.role)}</span>
                  <span className={`staff-card-status staff-card-status--${member.status}`}>
                    {statusLabel(member.status)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Staff detail panel */}
        {activeMember && (
          <aside className="staff-detail">
            <div className="staff-detail-header">
              <span className="staff-detail-emoji" aria-hidden="true">
                {activeMember.emoji}
              </span>
              <h3>{activeMember.name}</h3>
              <button
                className="staff-detail-close"
                onClick={() => setSelectedStaff(null)}
                aria-label="Close staff detail"
              >
                ×
              </button>
            </div>

            <div className="staff-detail-body">
              <div className="staff-detail-row">
                <span className="staff-detail-label">Role</span>
                <span className="staff-detail-value">
                  {roleLabel(activeMember.role)}
                </span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Shift</span>
                <span className="staff-detail-value">
                  {shiftLabel(activeMember.shift)}
                </span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Hours</span>
                <span className="staff-detail-value">{shiftHours(activeMember.shift)}</span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Status</span>
                <span className={`staff-detail-value staff-detail-status staff-detail-status--${activeMember.status}`}>
                  {statusLabel(activeMember.status)}
                </span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Email</span>
                <span className="staff-detail-value staff-detail-email">
                  {activeMember.email}
                </span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Phone</span>
                <span className="staff-detail-value">{activeMember.phone}</span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Hire Date</span>
                <span className="staff-detail-value">
                  {formatHireDate(activeMember.hireDate)}
                </span>
              </div>
              <div className="staff-detail-row">
                <span className="staff-detail-label">Orders Handled</span>
                <span className="staff-detail-value">
                  {activeMember.ordersHandled.toLocaleString()}
                </span>
              </div>
            </div>

            {activeMember.notes && (
              <div className="staff-detail-notes">
                <span className="staff-detail-notes-label">Notes</span>
                <p className="staff-detail-notes-text">{activeMember.notes}</p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export default StaffManagement;
