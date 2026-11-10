import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { productApi } from '@/lib/api';

const CatalogCtx = createContext(null);
export const useCatalog = () => useContext(CatalogCtx);

export function CatalogProvider({ children }) {
  const [all, setAll] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([productApi.list(), productApi.categories()]);
      setAll(p.product || []);
      setCategories((c.categories || []).map((x) => x.name).filter(Boolean));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => {
    // Storefront only shows products an admin has marked active.
    const products = all.filter((p) => p.status === 'active');
    const names = new Set(categories);
    products.forEach((p) => p.category && names.add(p.category));
    const bySection = (s) => products.filter((p) => p.section === s);
    return {
      all, products, loading, error, reload: load,
      categories: [...names],
      adminCategories: categories,
      bySection,
      byId: (id) => all.find((p) => p._id === id),
    };
  }, [all, categories, loading, error, load]);

  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}
