/**
 * Staff database — single source of truth for employee profiles.
 * Each staff member has a role, shift, and status.
 * Staff data is persisted to localStorage and includes scheduling info.
 */

export type StaffRole = 'manager' | 'barista' | 'cashier' | 'server' | 'chef';

export type StaffShift = 'morning' | 'afternoon' | 'evening';

export type StaffStatus = 'active' | 'on-break' | 'off';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  shift: StaffShift;
  email: string;
  phone: string;
  status: StaffStatus;
  hireDate: string; // ISO date string (YYYY-MM-DD)
  emoji: string;
  ordersHandled: number;
  notes: string;
}

/** Role definitions with display metadata. */
export const STAFF_ROLES: { value: StaffRole | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Staff', icon: '👥' },
  { value: 'manager', label: 'Manager', icon: '👔' },
  { value: 'barista', label: 'Barista', icon: '☕' },
  { value: 'cashier', label: 'Cashier', icon: '💳' },
  { value: 'server', label: 'Server', icon: '🍽️' },
  { value: 'chef', label: 'Chef', icon: '👨‍🍳' },
];

/** Shift display metadata. */
export const SHIFTS: { value: StaffShift; label: string; icon: string; hours: string }[] = [
  { value: 'morning', label: 'Morning', icon: '🌅', hours: '6 AM – 2 PM' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️', hours: '2 PM – 10 PM' },
  { value: 'evening', label: 'Evening', icon: '🌙', hours: '10 PM – 6 AM' },
];

const STAFF_KEY = 'mpro_staff';

/** Default seed data — used on first load when no localStorage data exists. */
const SEED_STAFF: StaffMember[] = [
  {
    id: 's1', name: 'Alice Chen', role: 'manager', shift: 'morning',
    email: 'alice@mprocafe.com', phone: '(555) 201-1001', status: 'active',
    hireDate: '2024-03-15', emoji: '👩‍💼', ordersHandled: 1240, notes: 'Store manager. Handles scheduling and vendor relations.',
  },
  {
    id: 's2', name: 'Marcus Rivera', role: 'barista', shift: 'morning',
    email: 'marcus@mprocafe.com', phone: '(555) 201-1002', status: 'active',
    hireDate: '2025-01-10', emoji: '🧔', ordersHandled: 890, notes: 'Latte art specialist. Trains new baristas.',
  },
  {
    id: 's3', name: 'Priya Patel', role: 'barista', shift: 'afternoon',
    email: 'priya@mprocafe.com', phone: '(555) 201-1003', status: 'active',
    hireDate: '2025-06-22', emoji: '👩‍🦱', ordersHandled: 620, notes: 'Tea and specialty drinks expert.',
  },
  {
    id: 's4', name: 'Jordan Taylor', role: 'cashier', shift: 'morning',
    email: 'jordan@mprocafe.com', phone: '(555) 201-1004', status: 'on-break',
    hireDate: '2025-03-01', emoji: '🧑‍💻', ordersHandled: 1050, notes: 'Fastest order entry. Helps with inventory counts.',
  },
  {
    id: 's5', name: 'Sophia Martinez', role: 'cashier', shift: 'afternoon',
    email: 'sophia@mprocafe.com', phone: '(555) 201-1005', status: 'active',
    hireDate: '2025-08-14', emoji: '👩', ordersHandled: 480, notes: 'Bilingual (English/Spanish). Great with customers.',
  },
  {
    id: 's6', name: 'Devon Kim', role: 'server', shift: 'morning',
    email: 'devon@mprocafe.com', phone: '(555) 201-1006', status: 'active',
    hireDate: '2024-11-05', emoji: '👨', ordersHandled: 760, notes: 'Floor lead for dine-in service. Upsells desserts.',
  },
  {
    id: 's7', name: 'Lily Thompson', role: 'server', shift: 'afternoon',
    email: 'lily@mprocafe.com', phone: '(555) 201-1007', status: 'off',
    hireDate: '2025-02-18', emoji: '👩‍🦰', ordersHandled: 340, notes: 'Part-time. Available weekends only.',
  },
  {
    id: 's8', name: 'Carlos Mendez', role: 'chef', shift: 'morning',
    email: 'carlos@mprocafe.com', phone: '(555) 201-1008', status: 'active',
    hireDate: '2024-06-01', emoji: '👨‍🍳', ordersHandled: 1550, notes: 'Head chef. Creates weekly specials. Manages food cost.',
  },
  {
    id: 's9', name: 'Aisha Johnson', role: 'chef', shift: 'afternoon',
    email: 'aisha@mprocafe.com', phone: '(555) 201-1009', status: 'active',
    hireDate: '2025-04-12', emoji: '👩‍🍳', ordersHandled: 580, notes: 'Pastry and baked goods specialist.',
  },
  {
    id: 's10', name: 'Ryan O\'Brien', role: 'barista', shift: 'evening',
    email: 'ryan@mprocafe.com', phone: '(555) 201-1010', status: 'active',
    hireDate: '2025-09-01', emoji: '👨', ordersHandled: 290, notes: 'Night owl. Handles closing cleanup and prep.',
  },
];

/** Load staff from localStorage, falling back to seed data. */
export function loadStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) return SEED_STAFF.map((s) => ({ ...s }));
    return JSON.parse(raw);
  } catch {
    return SEED_STAFF.map((s) => ({ ...s }));
  }
}

/** Persist the full staff array to localStorage. */
export function saveStaff(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/** Get the count of staff members by role. */
export function getStaffCountByRole(role: StaffRole): number {
  return loadStaff().filter((s) => s.role === role).length;
}

/** Get staff count by status. */
export function getStaffCountByStatus(status: StaffStatus): number {
  return loadStaff().filter((s) => s.status === status).length;
}

/** Get staff count by shift. */
export function getStaffCountByShift(shift: StaffShift): number {
  return loadStaff().filter((s) => s.shift === shift).length;
}
