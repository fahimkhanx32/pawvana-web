import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartApi } from '@/lib/api';
import { priceOf, sleep } from '@/lib/helpers';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null); // product id being added

  const refresh = useCallback(async () => {
    if (!user?._id) { setItems([]); return; }
    try {
      const d = await cartApi.get(user._id);
      // the API also returns the populated user document (incl. password hash) — never keep it in memory
      setItems((d.cart || []).filter((i) => i.product).map(({ user: _u, ...rest }) => rest));
    } catch (e) {
      toast.error(e.message);
    }
  }, [user?._id, toast]);

  useEffect(() => {
    if (!user?._id) { setItems([]); return; }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const requireLogin = useCallback(() => {
    toast.info('Sign in to start your cart');
    navigate('/login', { state: { from: location.pathname + location.search } });
  }, [navigate, location, toast]);

  const addToCart = useCallback(async (product, qty = 1) => {
    if (!user?._id) { requireLogin(); return false; }
    const existing = items.find((i) => i.product._id === product._id);
    const have = existing?.quantity || 0;
    if (have + qty > Number(product.stock || 0)) {
      toast.error(have >= product.stock ? 'You already have every available unit in your cart.' : `Only ${product.stock} available.`);
      return false;
    }
    setBusy(product._id);
    try {
      if (existing) {
        for (let k = 0; k < qty; k++) await cartApi.step(existing._id, 'plus');
      } else {
        await cartApi.add({ proid: product._id, userid: user._id, quantity: qty });
      }
      await sleep(350); // the backend answers before it finishes saving a new cart row
      await refresh();
      toast.success(`${product.title} added to your cart`);
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setBusy(null);
    }
  }, [user?._id, items, refresh, requireLogin, toast]);

  const remove = useCallback(async (item) => {
    setItems((s) => s.filter((i) => i._id !== item._id));
    try { await cartApi.remove(item._id); } catch (e) { toast.error(e.message); refresh(); }
  }, [refresh, toast]);

  const changeQty = useCallback(async (item, delta) => {
    if (delta < 0 && item.quantity <= 1) return remove(item);
    if (delta > 0 && item.quantity + 1 > Number(item.product.stock || 0)) {
      toast.error(`Only ${item.product.stock} available.`);
      return;
    }
    setItems((s) => s.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + delta } : i)));
    try {
      await cartApi.step(item._id, delta > 0 ? 'plus' : 'minus');
    } catch (e) {
      toast.error(e.message);
      refresh();
    }
  }, [remove, refresh, toast]);

  const clear = useCallback(async () => {
    const current = items;
    setItems([]);
    await Promise.allSettled(current.map((i) => cartApi.remove(i._id)));
  }, [items]);

  const value = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + priceOf(i.product).price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return { items, loading, busy, subtotal, count, addToCart, changeQty, remove, clear, refresh };
  }, [items, loading, busy, addToCart, changeQty, remove, clear, refresh]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
