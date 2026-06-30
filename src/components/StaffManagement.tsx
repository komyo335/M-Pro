import { useState } from 'react';
import type { StaffRole, StaffShift, StaffMember } from '../data/staff';
import { STAFF_ROLES, SHIFTS, loadStaff, saveStaff } from '../data/staff';
import './StaffManagement.css';

const ROLE_EMOJIS: Record<StaffRole, string> = {
  manager: '👔',
  barista: '☕',
  cashier: '💳',
  server: '🍽️',
  chef: '👨‍🍳',
};

const STATUS_LABELS: Record<string, string> = {
  active: '🟢 Active',
  'on-break': '🟡 On Break',
  off: '⚫ Off',
};

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'cashier' as StaffRole,
  shift: 'morning' as StaffShift,
};

function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(loadStaff);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateAdmin = () => {
    if (!newUser.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!newUser.email.trim()) {
      setFormError('Email is required.');
      return;
    }

    const newMember: StaffMember = {
      id: `s${Date.now()}`,
      name: newUser.name.trim(),
      role: newUser.role,
      shift: newUser.shift,
      email: newUser.email.trim(),
      phone: newUser.phone.trim(),
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      emoji: ROLE_EMOJIS[newUser.role],
      ordersHandled: 0,
      notes: 'New admin created via Admin Management.',
    };

    const updated = [...staff, newMember];
    saveStaff(updated);
    setStaff(updated);

    setShowForm(false);
    setNewUser(EMPTY_FORM);
    setFormError(null);
  };

  const handleDeleteAdmin = (id: string) => {
    if (!window.confirm('Remove this admin? This cannot be undone.')) return;
    const updated = staff.filter((s) => s.id !== id);
    saveStaff(updated);
    setStaff(updated);
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewUser(EMPTY_FORM);
    setFormError(null);
  };

  return (
    <div className="staff-mgmt">
      {/* ── Header ────────────────────────────────────── */}
      <header className="staff-header">
        <h2>Admin Management</h2>
        <p className="staff-subtitle">
          Manage employee profiles, shifts, and performance across your team.
        </p>
      </header>

      {/* ── Add User Section ──────────────────────────── */}
      <div className="staff-add-section">
        {!showForm ? (
          <button className="staff-add-btn" onClick={() => setShowForm(true)}>
            <span className="staff-add-btn-icon" aria-hidden="true">➕</span>
            Add Admin
          </button>
        ) : (
          <div className="staff-add-form">
            <h3>Create New Admin</h3>
            <div className="staff-form-grid">
              <div className="staff-form-field">
                <label htmlFor="staff-name">Name</label>
                <input
                  id="staff-name"
                  type="text"
                  placeholder="Full name"
                  value={newUser.name}
                  onChange={(e) => { setNewUser({ ...newUser, name: e.target.value }); setFormError(null); }}
                />
              </div>
              <div className="staff-form-field">
                <label htmlFor="staff-email">Email</label>
                <input
                  id="staff-email"
                  type="email"
                  placeholder="email@example.com"
                  value={newUser.email}
                  onChange={(e) => { setNewUser({ ...newUser, email: e.target.value }); setFormError(null); }}
                />
              </div>
              <div className="staff-form-field">
                <label htmlFor="staff-phone">Phone</label>
                <input
                  id="staff-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
              <div className="staff-form-field">
                <label htmlFor="staff-role">Role</label>
                <select
                  id="staff-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as StaffRole })}
                >
                  {STAFF_ROLES.filter((r) => r.value !== 'all').map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="staff-form-field">
                <label htmlFor="staff-shift">Shift</label>
                <select
                  id="staff-shift"
                  value={newUser.shift}
                  onChange={(e) => setNewUser({ ...newUser, shift: e.target.value as StaffShift })}
                >
                  {SHIFTS.map((shift) => (
                    <option key={shift.value} value={shift.value}>
                      {shift.icon} {shift.label} ({shift.hours})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="staff-form-error">{formError}</p>
            )}

            <div className="staff-form-actions">
              <button className="staff-form-submit" onClick={handleCreateAdmin}>
                ✓ Create Admin
              </button>
              <button className="staff-form-cancel" onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Admin List ────────────────────────────────── */}
      <div className="staff-list">
        <h3 className="staff-list-title">All Admins ({staff.length})</h3>
        {staff.length === 0 ? (
          <p className="staff-list-empty">No admins yet. Create one above.</p>
        ) : (
          <div className="staff-list-grid">
            {staff.map((member) => (
              <div key={member.id} className="staff-card">
                <div className="staff-card-header">
                  <span className="staff-card-emoji" aria-hidden="true">{member.emoji}</span>
                  <div className="staff-card-info">
                    <span className="staff-card-name">{member.name}</span>
                    <span className="staff-card-role">
                      {STAFF_ROLES.find((r) => r.value === member.role)?.label ?? member.role}
                    </span>
                  </div>
                  <button
                    className="staff-card-delete"
                    onClick={() => handleDeleteAdmin(member.id)}
                    aria-label={`Remove ${member.name}`}
                    title="Remove admin"
                  >
                    ×
                  </button>
                </div>
                <div className="staff-card-details">
                  <span className="staff-card-detail">{member.email}</span>
                  {member.phone && <span className="staff-card-detail">{member.phone}</span>}
                  <span className="staff-card-detail">
                    {SHIFTS.find((s) => s.value === member.shift)?.label ?? member.shift} shift
                  </span>
                  <span className={`staff-card-status staff-card-status--${member.status}`}>
                    {STATUS_LABELS[member.status] ?? member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffManagement;
