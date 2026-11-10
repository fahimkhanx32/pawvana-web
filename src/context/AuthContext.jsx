import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ApiError, authApi, userApi } from '@/lib/api';
import { store } from '@/lib/helpers';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const STAFF = ['admin', 'editor', 'vendor'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => store.get('user'));

  const persist = useCallback((u) => {
    setUser(u);
    if (u) store.set('user', u); else store.del('user');
  }, []);

  const hydrate = useCallback(async (base) => {
    let full = base;
    try {
      const r = await userApi.one(base._id);
      full = { ...base, ...r.userData };
    } catch { /* basic profile from login is enough */ }
    delete full.password;
    return full;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email.trim(), password);
    if (res.data?.isHold) throw new ApiError('This account is on hold. Please contact support.');
    let full = await hydrate(res.data);

    // Phone typed at registration can't be saved by the backend's /registration, so apply it on first login.
    const key = `pendingPhone:${email.trim().toLowerCase()}`;
    const pending = store.get(key);
    if (pending && !full.phone) {
      try { await userApi.update(full._id, { phone: pending }); full = { ...full, phone: pending }; } catch { /* retry next login */ }
    }
    if (pending) store.del(key);

    persist(full);
    return full;
  }, [hydrate, persist]);

  const register = useCallback(async ({ name, email, phone, password, confirmPassword }) => {
    const res = await authApi.register({ name: name.trim(), email: email.trim(), password, confirmPassword });
    if (phone?.trim()) store.set(`pendingPhone:${email.trim().toLowerCase()}`, phone.trim());
    return res;
  }, []);

  const logout = useCallback(() => persist(null), [persist]);

  const refresh = useCallback(async () => {
    if (!user?._id) return null;
    const full = await hydrate(user);
    persist(full);
    return full;
  }, [user, hydrate, persist]);

  const updateProfile = useCallback(async (body) => {
    await userApi.update(user._id, body);
    return refresh();
  }, [user, refresh]);

  const value = useMemo(() => ({
    user,
    isAuthed: !!user,
    isStaff: !!user && STAFF.includes(user.role),
    isAdmin: user?.role === 'admin',
    login, register, logout, refresh, updateProfile,
  }), [user, login, register, logout, refresh, updateProfile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
