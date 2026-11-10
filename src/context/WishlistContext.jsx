import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { store } from '@/lib/helpers';

const WishCtx = createContext(null);
export const useWishlist = () => useContext(WishCtx);

/** Stored on this device only (the backend has no wishlist endpoint). */
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => store.get('wishlist', []));
  const toggle = useCallback((id) => {
    setIds((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      store.set('wishlist', next);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ ids, toggle, has: (id) => ids.includes(id) }), [ids, toggle]);
  return <WishCtx.Provider value={value}>{children}</WishCtx.Provider>;
}
