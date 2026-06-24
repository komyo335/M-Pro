const KEY = 'mpro_users';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

function generateUserId(): string {
  return 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as User[];
  } catch {
    /* corrupted data — fall through to default */
  }
  return [];
}

function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(users));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
}

export function registerUser(name: string, email: string, password: string): { ok: true; user: User } | { ok: false; error: string } {
  const users = loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { ok: false, error: 'An account with this email already exists' };

  const user: User = {
    id: generateUserId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function loginUser(email: string, password: string): { ok: true; user: User } | { ok: false; error: string } {
  const users = loadUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return { ok: false, error: 'No account found with this email' };
  if (user.password !== password) return { ok: false, error: 'Incorrect password' };
  return { ok: true, user };
}

export function getUserCount(): number {
  return loadUsers().length;
}
