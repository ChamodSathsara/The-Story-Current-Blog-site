import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AdminUser } from '../types/models';
import { uid } from '../utils/format';
import { checkRateLimit, hashPassword, randomToken, verifyPassword } from '../utils/security';
import { useStore } from './StoreContext';

const SESSION_KEY = 'tsc_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

interface Session {
  userId: string;
  token: string;
  expiresAt: number;
}

interface AuthValue {
  user: AdminUser | null;
  needsSetup: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  setup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (current: string, next: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as Session | null;
    if (s && s.expiresAt > Date.now()) return s;
  } catch {

    /* ignore */}
  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const { db, upsert, logActivity, setActor } = useStore();
  const [session, setSession] = useState<Session | null>(readSession);

  const user = useMemo(() => session ? db.adminUsers.find((u) => u.id === session.userId) ?? null : null, [session, db.adminUsers]);

  useEffect(() => {
    setActor(user ? user.name : 'System');
  }, [user, setActor]);

  useEffect(() => {
    if (!session) return;
    const t = window.setTimeout(() => setSession(null), session.expiresAt - Date.now());
    return () => window.clearTimeout(t);
  }, [session]);

  const startSession = (userId: string) => {
    const s: Session = { userId, token: randomToken(), expiresAt: Date.now() + SESSION_TTL_MS };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const login = useCallback(async (email: string, password: string) => {
    const limit = checkRateLimit('login', 5, 15 * 60 * 1000);
    if (!limit.ok) return `Too many attempts. Try again in ${Math.ceil(limit.retryInSec / 60)} minute(s).`;
    const found = db.adminUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const ok = found ? await verifyPassword(password, found.passwordHash, found.salt) : false;
    if (!found || !ok) return 'Invalid email or password.';
    upsert('adminUsers', { ...found, lastLoginAt: new Date().toISOString() });
    startSession(found.id);
    setActor(found.name);
    logActivity('login', 'auth', `${found.email} signed in`);
    return null;
  }, [db.adminUsers, upsert, logActivity, setActor]);

  const setup = useCallback(async (name: string, email: string, password: string) => {
    if (db.adminUsers.length > 0) throw new Error('An administrator already exists.');
    const { hash, salt } = await hashPassword(password);
    const admin: AdminUser = { id: uid(), name, email: email.trim().toLowerCase(), passwordHash: hash, salt, createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
    setActor(name);
    upsert('adminUsers', admin, `First administrator account created (${admin.email})`);
    startSession(admin.id);
  }, [db.adminUsers.length, upsert, setActor]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    if (!user) return 'Not signed in.';
    const ok = await verifyPassword(current, user.passwordHash, user.salt);
    if (!ok) return 'Current password is incorrect.';
    const { hash, salt } = await hashPassword(next);
    upsert('adminUsers', { ...user, passwordHash: hash, salt }, `Password changed for ${user.email}`);
    return null;
  }, [user, upsert]);

  const value = useMemo<AuthValue>(
    () => ({ user, needsSetup: db.adminUsers.length === 0, login, setup, logout, changePassword }),
    [user, db.adminUsers.length, login, setup, logout, changePassword]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
