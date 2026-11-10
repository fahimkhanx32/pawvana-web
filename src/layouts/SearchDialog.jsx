import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, SearchX } from 'lucide-react';
import Sheet from '@/components/ui/Sheet';
import FloatField from '@/components/ui/FloatField';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { useCatalog } from '@/context/CatalogContext';
import { categoryIcon, mainImage, money, priceOf } from '@/lib/helpers';

export default function SearchDialog({ open, onClose }) {
  const { products, categories } = useCatalog();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();

  const hits = useMemo(() => {
    if (!term) return [];
    return products
      .filter((p) => [p.title, p.category, p.brand, ...(p.tag || [])].filter(Boolean).join(' ').toLowerCase().includes(term))
      .slice(0, 6);
  }, [products, term]);

  const go = (e) => {
    e?.preventDefault();
    onClose();
    navigate(term ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
  };

  return (
    <Sheet open={open} onClose={onClose} side="modal" className="md:max-w-2xl md:!mb-[10vh] md:self-start">
      <form onSubmit={go} className="p-4 sm:p-5">
        <FloatField icon={Search} label="Search products" placeholder="Food, toys, grooming, brand…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </form>

      <div className="px-4 pb-5 sm:px-5">
        {!term && categories.length > 0 && (
          <div>
            <p className="mb-2.5 px-1 text-sm text-muted">Browse by category</p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 10).map((c) => {
                const Icon = categoryIcon(c);
                return (
                  <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} onClick={onClose} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm transition hover:bg-surface2">
                    <Icon size={16} className="text-brand" />{c}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {term && hits.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center text-muted">
            <SearchX size={28} />
            <p className="mt-2">Nothing matches “{q.trim()}”. Try a different word.</p>
          </div>
        )}

        {hits.length > 0 && (
          <ul className="space-y-1">
            {hits.map((p) => (
              <li key={p._id}>
                <Link to={`/product/${encodeURIComponent(p.slug || p._id)}`} onClick={onClose} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-surface2">
                  <SmartImage src={mainImage(p)} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.title}</span>
                    <span className="block truncate text-sm text-muted">{p.category}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{money(priceOf(p).price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {term && (
          <Button full variant="soft" icon={ArrowRight} iconPosition="right" onClick={go} className="mt-3">
            See all results for “{q.trim()}”
          </Button>
        )}
      </div>
    </Sheet>
  );
}
