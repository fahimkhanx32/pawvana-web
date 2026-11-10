import { useState } from 'react';
import { Plus, Shapes, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import { EmptyState } from '@/components/ui/Bits';
import { PageHeader } from '@/layouts/AdminLayout';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import { productApi } from '@/lib/api';
import { categoryIcon } from '@/lib/helpers';

export default function Categories() {
  const { all, adminCategories, reload } = useCatalog();
  const toast = useToast();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const counts = all.reduce((a, p) => ({ ...a, [p.category]: (a[p.category] || 0) + 1 }), {});

  const add = async (e) => {
    e.preventDefault();
    const v = name.trim();
    if (v.length < 2) { setError('Enter a category name'); return; }
    if (adminCategories.some((c) => c.toLowerCase() === v.toLowerCase())) { setError('That category already exists'); return; }
    setError('');
    setBusy(true);
    try {
      await productApi.createCategory(v);
      setName('');
      toast.success(`“${v}” added`);
      setTimeout(reload, 300); // backend responds before the save finishes
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Categories" text="Group products the way pet parents look for them." />
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <form onSubmit={add} noValidate className="panel space-y-5 p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">New category</h2>
          <FloatField icon={Tag} label="Category name" placeholder="e.g. Dog food" value={name} onChange={(e) => setName(e.target.value)} error={error} />
          <Button type="submit" full icon={Plus} loading={busy}>Add category</Button>
        </form>

        <section className="panel p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">All categories</h2>
          {adminCategories.length === 0 ? (
            <EmptyState icon={Shapes} title="No categories yet" text="Add your first category to organise products." />
          ) : (
            <ul className="grid gap-3 xs:grid-cols-2">
              {adminCategories.map((c) => {
                const Icon = categoryIcon(c);
                return (
                  <li key={c} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={20} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c}</span><span className="text-sm text-muted">{counts[c] || 0} {(counts[c] || 0) === 1 ? 'product' : 'products'}</span></span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
