import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Banknote, BadgePercent, Boxes, Check, ChevronDown, FilterX, PackageSearch, Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import Sheet from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/Bits';
import { ProductGrid, ProductGridSkeleton } from '@/components/shop/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { categoryIcon, cx, priceOf, stockState } from '@/lib/helpers';

const PAGE = 12;
const sorts = [
  { value: '', label: 'Featured' },
  { value: 'new', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

const Chip = ({ active, onClick, icon: Icon, children, count }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cx('inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition', active ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface hover:bg-surface2')}
  >
    {active ? <Check size={15} /> : Icon && <Icon size={15} className="text-muted" />}
    {children}
    {count != null && <span className="text-xs text-muted">{count}</span>}
  </button>
);

function Filters({ f, set, categories, brands, counts, clear, activeCount }) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <div className="flex flex-wrap gap-2">
          <Chip active={!f.category} onClick={() => set({ category: '' })}>All</Chip>
          {categories.map((c) => (
            <Chip key={c} active={f.category === c} icon={categoryIcon(c)} count={counts[c] || 0} onClick={() => set({ category: f.category === c ? '' : c })}>{c}</Chip>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Brand</h3>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => <Chip key={b} active={f.brand === b} icon={Tag} onClick={() => set({ brand: f.brand === b ? '' : b })}>{b}</Chip>)}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold">Price</h3>
        <div className="space-y-4">
          <FloatField icon={Banknote} label="Min price" type="number" inputProps={{ min: 0, inputMode: 'numeric' }} placeholder="0" value={f.min} onChange={(e) => set({ min: e.target.value })} />
          <FloatField icon={Banknote} label="Max price" type="number" inputProps={{ min: 0, inputMode: 'numeric' }} placeholder="Any" value={f.max} onChange={(e) => set({ max: e.target.value })} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={f.sale} icon={BadgePercent} onClick={() => set({ sale: f.sale ? '' : '1' })}>On sale</Chip>
        <Chip active={f.stock} icon={Boxes} onClick={() => set({ stock: f.stock ? '' : '1' })}>In stock only</Chip>
      </div>

      {activeCount > 0 && <Button variant="quiet" full icon={FilterX} onClick={clear}>Clear all filters</Button>}
    </div>
  );
}

export default function Shop() {
  const { products, categories, loading, error } = useCatalog();
  const [sp, setSp] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const f = {
    q: sp.get('q') || '', category: sp.get('category') || '', brand: sp.get('brand') || '',
    sort: sp.get('sort') || '', sale: sp.get('sale') === '1', stock: sp.get('stock') === '1',
    min: sp.get('min') || '', max: sp.get('max') || '',
  };
  const set = (patch) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? n.delete(k) : n.set(k, v)));
    setSp(n, { replace: true });
  };
  const clear = () => setSp(new URLSearchParams(f.q ? { q: f.q } : {}), { replace: true });

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].slice(0, 14), [products]);
  const counts = useMemo(() => products.reduce((a, p) => ({ ...a, [p.category]: (a[p.category] || 0) + 1 }), {}), [products]);

  const list = useMemo(() => {
    const term = f.q.trim().toLowerCase();
    const min = f.min === '' ? null : Number(f.min);
    const max = f.max === '' ? null : Number(f.max);
    let out = products.filter((p) => {
      const price = priceOf(p);
      if (term && ![p.title, p.category, p.brand, p.shortDescription, ...(p.tag || [])].filter(Boolean).join(' ').toLowerCase().includes(term)) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.brand && p.brand !== f.brand) return false;
      if (f.sale && !price.hasDiscount) return false;
      if (f.stock && stockState(p.stock).key === 'out') return false;
      if (min != null && price.price < min) return false;
      if (max != null && price.price > max) return false;
      return true;
    });
    const by = {
      new: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      'price-asc': (a, b) => priceOf(a).price - priceOf(b).price,
      'price-desc': (a, b) => priceOf(b).price - priceOf(a).price,
      name: (a, b) => a.title.localeCompare(b.title),
    }[f.sort];
    if (by) out = [...out].sort(by);
    return out;
  }, [products, f.q, f.category, f.brand, f.sale, f.stock, f.min, f.max, f.sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const key = sp.toString();
  useEffect(() => setShown(PAGE), [key]);

  const activeCount = [f.category, f.brand, f.sale, f.stock, f.min, f.max].filter(Boolean).length;
  const chips = [
    f.category && { label: f.category, off: () => set({ category: '' }) },
    f.brand && { label: f.brand, off: () => set({ brand: '' }) },
    f.sale && { label: 'On sale', off: () => set({ sale: '' }) },
    f.stock && { label: 'In stock', off: () => set({ stock: '' }) },
    f.min && { label: `From ${f.min}`, off: () => set({ min: '' }) },
    f.max && { label: `Up to ${f.max}`, off: () => set({ max: '' }) },
  ].filter(Boolean);

  const filterProps = { f, set, categories, brands, counts, clear, activeCount };

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{f.category || (f.sale ? 'Deals' : 'Shop')}</h1>
        <p className="mt-1.5 text-muted">{loading ? 'Loading products…' : `${list.length} ${list.length === 1 ? 'product' : 'products'}`}</p>
      </div>

      <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:items-start lg:gap-8">
        <aside className="hidden lg:block">
          <div className="panel sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto p-5"><Filters {...filterProps} /></div>
        </aside>

        <div className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-[1fr_16rem]">
            <FloatField icon={Search} label="Search in shop" placeholder="Name, brand or tag" value={f.q} onChange={(e) => set({ q: e.target.value })} />
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <FloatField icon={ArrowUpDown} label="Sort by" select options={sorts} value={f.sort} onChange={(e) => set({ sort: e.target.value })} />
              </div>
              <Button variant="quiet" icon={SlidersHorizontal} onClick={() => setFiltersOpen(true)} className="relative !h-[60px] !rounded-[22px] lg:hidden" aria-label="Open filters">
                <span className="hidden xs:inline">Filters</span>
                {activeCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-semibold text-[#2b1a04]">{activeCount}</span>}
              </Button>
            </div>
          </div>

        <div className="mt-6">
          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={c.off} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-sm text-brand" aria-label={`Remove filter ${c.label}`}>
                  {c.label}<X size={14} />
                </button>
              ))}
              <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted hover:text-ink"><FilterX size={14} />Clear all</button>
            </div>
          )}

          {error ? (
            <EmptyState icon={PackageSearch} title="Couldn’t load products" text={error} />
          ) : loading ? (
            <ProductGridSkeleton n={8} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match"
              text="Try removing a filter or searching for something broader."
              action={<Button icon={FilterX} onClick={() => setSp(new URLSearchParams(), { replace: true })}>Reset search</Button>}
            />
          ) : (
            <>
              <ProductGrid products={list.slice(0, shown)} />
              {shown < list.length && (
                <div className="mt-10 flex justify-center">
                  <Button variant="quiet" size="lg" icon={ChevronDown} iconPosition="right" onClick={() => setShown((s) => s + PAGE)}>
                    Show more ({list.length - shown} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} side="bottom" title="Filters" icon={SlidersHorizontal}
        footer={<Button full icon={Check} onClick={() => setFiltersOpen(false)}>Show {list.length} {list.length === 1 ? 'product' : 'products'}</Button>}>
        <div className="p-5"><Filters {...filterProps} /></div>
      </Sheet>
    </div>
  );
}
