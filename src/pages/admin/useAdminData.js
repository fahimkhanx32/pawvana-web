import { useCallback, useEffect, useState } from 'react';
import { orderApi, userApi } from '@/lib/api';

/**
 * The backend has no "all orders" endpoint, so orders are gathered per customer
 * (GET /allusers, then GET /getorders/:id for each). Fine for a small shop;
 * add a dedicated endpoint before the customer list grows large.
 */
export function useAdminData({ withOrders = false } = {}) {
  const [state, setState] = useState({ users: null, orders: null, error: '' });

  const load = useCallback(async () => {
    try {
      const res = await userApi.all();
      const users = (res.userData || []).map(({ password: _p, ...u }) => u); // the API leaks password hashes — drop them immediately
      let orders = null;
      if (withOrders) {
        const settled = await Promise.allSettled(users.map((u) => orderApi.forUser(u._id).then((r) => (r.data || []).map((o) => ({ ...o, customer: u })))));
        orders = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      setState({ users, orders, error: '' });
    } catch (e) {
      setState({ users: [], orders: [], error: e.message });
    }
  }, [withOrders]);

  useEffect(() => { load(); }, [load]);
  return { ...state, loading: state.users === null, reload: load };
}
