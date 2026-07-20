<<<<<<< HEAD
<<<<<<< HEAD
import { useState} from 'react';
=======
import { useState } from 'react';
>>>>>>> test-1
import type { StaffRole, StaffShift, StaffMember } from '../data/staff';
=======
import { useState } from 'react';
import type { StaffMember, StaffRole, StaffShift } from '../data/staff';
>>>>>>> dev-1
import { STAFF_ROLES, SHIFTS, loadStaff, saveStaff } from '../data/staff';
import './StaffManagement.css';

const STATUS_LABELS: Record<string, string> = {
  active: '🟢 Active',
  'on-break': '🟡 On Break',
  off: '⚫ Off',
};

const ROLE_EMOJIS: Record<StaffRole, string> = {
  manager: '👔',
  barista: '☕',
  cashier: '💳',
  server: '🍽️',
  chef: '👨‍🍳',
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

  const handleCreateStaff = () => {
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
      notes: '',
    };

    const updated = [...staff, newMember];
    saveStaff(updated);
    setStaff(updated);

    setShowForm(false);
    setNewUser(EMPTY_FORM);
    setFormError(null);
  };

  const handleDeleteStaff = (id: string) => {
    if (!window.confirm('Remove this staff member? This cannot be undone.')) return;
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
        <h2>Staff Management</h2>
        <p className="staff-subtitle">
          Manage employee profiles, shifts, and performance across your team.
        </p>
      </header>

      {/* ── Add Staff Button / Form ────────────────────── */}
      <div className="staff-add-section">
        {!showForm ? (
          <button className="staff-add-btn" onClick={() => setShowForm(true)}>
            <span className="staff-add-btn-icon" aria-hidden="true">➕</span>
            Add Staff
          </button>
        ) : (
          <div className="staff-add-form">
            <h3>New Staff Member</h3>

            <div className="staff-form-grid">
              <div className="staff-form-field">
                <label className="staff-form-label">Name</label>
                <input
                  type="text"
                  className="staff-form-input"
                  placeholder="Full name"
                  value={newUser.name}
                  onChange={(e) => { setNewUser({ ...newUser, name: e.target.value }); setFormError(null); }}
                />
              </div>
              <div className="staff-form-field">
                <label className="staff-form-label">Email</label>
                <input
                  type="email"
                  className="staff-form-input"
                  placeholder="email@example.com"
                  value={newUser.email}
                  onChange={(e) => { setNewUser({ ...newUser, email: e.target.value }); setFormError(null); }}
                />
              </div>
              <div className="staff-form-field">
                <label className="staff-form-label">Phone</label>
                <input
                  type="tel"
                  className="staff-form-input"
                  placeholder="(555) 123-4567"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Role selection */}
            <div className="staff-form-field">
              <label className="staff-form-label">Role</label>
              <div className="staff-form-btn-group">
                {STAFF_ROLES.filter((r) => r.value !== 'all').map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    className={`staff-form-btn ${newUser.role === role.value ? 'active' : ''}`}
                    onClick={() => setNewUser({ ...newUser, role: role.value as StaffRole })}
                  >
                    <span>{role.icon}</span>
                    <span>{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shift selection */}
            <div className="staff-form-field">
              <label className="staff-form-label">Shift</label>
              <div className="staff-form-btn-group">
                {SHIFTS.map((shift) => (
                  <button
                    key={shift.value}
                    type="button"
                    className={`staff-form-btn ${newUser.shift === shift.value ? 'active' : ''}`}
                    onClick={() => setNewUser({ ...newUser, shift: shift.value as StaffShift })}
                  >
                    <span>{shift.icon}</span>
                    <span>{shift.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="staff-form-error">{formError}</p>
            )}

            <div className="staff-form-actions">
              <button className="staff-form-submit" onClick={handleCreateStaff}>
                ✓ Create Staff
              </button>
              <button className="staff-form-cancel" onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Staff List ────────────────────────────────── */}
      <div className="staff-list">
        <h3 className="staff-list-title">All Staff ({staff.length})</h3>
        {staff.length === 0 ? (
          <p className="staff-list-empty">No staff members found.</p>
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
                    onClick={() => handleDeleteStaff(member.id)}
                    aria-label={`Remove ${member.name}`}
                    title="Remove staff member"
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
