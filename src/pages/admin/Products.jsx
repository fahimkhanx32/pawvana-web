import { useMemo, useState } from 'react';
import { ExternalLink, FileSpreadsheet, Layers, PackagePlus, PackageSearch, Pencil, Search, Shapes, Trash2, Upload, X } from 'lucide-react';
import Button, { IconButton } from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import Sheet from '@/components/ui/Sheet';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SmartImage from '@/components/ui/SmartImage';
import { Badge, EmptyState, Skeleton } from '@/components/ui/Bits';
import { PageHeader } from '@/layouts/AdminLayout';
import ProductForm from './ProductForm';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import { productApi } from '@/lib/api';
import { mainImage, money, priceOf, stockState } from '@/lib/helpers';

const statusTone = { active: 'brand', pending: 'accent', inactive: 'muted' };
const columns = ['title', 'description', 'additionalInfo', 'price', 'discountType', 'discount', 'discountStartDate', 'discountEndDate', 'sku', 'stock', 'brand', 'shortDescription', 'category', 'tag', 'status', 'images'];

function BulkUpload({ onClose, onDone }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await productApi.bulk(fd);
      toast.success(res.message || 'Products imported');
      await onDone();
      onClose();
    } catch (e) {
      setError(e.data?.errors?.length ? `${e.message} (${e.data.errors.length} rows). Check column names and values.` : e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open onClose={onClose} side="modal" title="Bulk upload" subtitle="Import many products from an Excel file." icon={FileSpreadsheet}
      footer={<div className="grid grid-cols-2 gap-3"><Button variant="quiet" icon={X} onClick={onClose}>Cancel</Button><Button icon={Upload} disabled={!file} loading={busy} onClick={send}>Upload file</Button></div>}>
      <div className="space-y-5 p-5">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line px-4 py-8 text-center transition hover:bg-surface2">
          <FileSpreadsheet size={28} className="text-brand" />
          <span className="max-w-full truncate font-medium">{file ? file.name : 'Choose an .xlsx file'}</span>
          <span className="text-sm text-muted">One product per row</span>
          <input type="file" accept=".xlsx" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <div>
          <p className="mb-2 text-sm font-medium">Expected columns (first row)</p>
          <div className="flex flex-wrap gap-1.5">{columns.map((c) => <Badge key={c}>{c}</Badge>)}</div>
          <p className="mt-3 text-sm text-muted">In <b>tag</b> separate values with commas. In <b>images</b> write <code>path|true</code> for the main photo, comma-separated.</p>
        </div>
        {error && <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger">{error}</p>}
      </div>
    </Sheet>
  );
}

export default function Products() {
  const { all, adminCategories, loading, reload } = useCatalog();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [removing, setRemoving] = useState(null);
  const [bulk, setBulk] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cats = useMemo(() => [...new Set([...adminCategories, ...all.map((p) => p.category)].filter(Boolean))], [adminCategories, all]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...all]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .filter((p) => (!status || p.status === status) && (!category || p.category === category)
        && (!t || [p.title, p.sku, p.brand, p.category].filter(Boolean).join(' ').toLowerCase().includes(t)));
  }, [all, q, status, category]);

  const confirmDelete = async () => {
    setDeleting(true);
    try { await productApi.remove(removing._id); toast.success('Product deleted'); await reload(); setRemoving(null); }
    catch (e) { toast.error(e.message); }
    finally { setDeleting(false); }
  };

  const actions = (p) => (
    <div className="flex shrink-0 items-center">
      <IconButton icon={ExternalLink} label={`View ${p.title} in store`} to={`/product/${encodeURIComponent(p.slug || p._id)}`} size={40} />
      <IconButton icon={Pencil} label={`Edit ${p.title}`} onClick={() => setEditing(p)} size={40} />
      <IconButton icon={Trash2} label={`Delete ${p.title}`} onClick={() => setRemoving(p)} size={40} className="hover:!text-danger" />
    </div>
  );

  return (
    <>
      <PageHeader title="Products" text={`${all.length} in your catalogue`}>
        <Button variant="quiet" icon={FileSpreadsheet} onClick={() => setBulk(true)}>Bulk upload</Button>
        <Button icon={PackagePlus} onClick={() => setEditing(null)}>Add product</Button>
      </PageHeader>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_14rem_14rem]">
        <FloatField icon={Search} label="Search" placeholder="Name, SKU, brand" value={q} onChange={(e) => setQ(e.target.value)} />
        <FloatField icon={Layers} label="Status" select placeholder="All statuses" options={[{ value: '', label: 'All statuses' }, ...['active', 'pending', 'inactive'].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]} value={status} onChange={(e) => setStatus(e.target.value)} />
        <FloatField icon={Shapes} label="Category" select placeholder="All categories" options={[{ value: '', label: 'All categories' }, ...cats.map((c) => ({ value: c, label: c }))]} value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 !rounded-3xl" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={PackageSearch} title={all.length ? 'No products match' : 'No products yet'} text={all.length ? 'Try a different search or filter.' : 'Add your first product to start selling.'}
          action={all.length ? undefined : <Button icon={PackagePlus} onClick={() => setEditing(null)}>Add product</Button>} />
      ) : (
        <>
          {/* table on large screens */}
          <div className="panel hidden overflow-hidden md:block">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-line bg-surface2/60 text-sm text-muted">
                <tr><th className="px-5 py-3 font-medium">Product</th><th className="px-3 py-3 font-medium">Price</th><th className="px-3 py-3 font-medium">Stock</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((p) => {
                  const pr = priceOf(p); const st = stockState(p.stock);
                  return (
                    <tr key={p._id} className="transition hover:bg-surface2/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <SmartImage src={mainImage(p)} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                          <div className="min-w-0"><p className="max-w-[22rem] truncate font-medium">{p.title}</p><p className="truncate text-sm text-muted">{p.category}{p.sku ? ` · ${p.sku}` : ''}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 tabular-nums"><span className="font-medium">{money(pr.price)}</span>{pr.hasDiscount && <span className="ml-2 text-sm text-muted line-through">{money(pr.original)}</span>}</td>
                      <td className="px-3 py-3"><Badge tone={st.tone}>{st.key === 'in' ? p.stock : st.label}</Badge></td>
                      <td className="px-3 py-3"><Badge tone={statusTone[p.status] || 'muted'} className="capitalize">{p.status}</Badge></td>
                      <td className="px-3 py-3">{actions(p)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* cards on phones */}
          <ul className="space-y-3 md:hidden">
            {list.map((p) => {
              const pr = priceOf(p); const st = stockState(p.stock);
              return (
                <li key={p._id} className="panel p-3.5">
                  <div className="flex gap-3">
                    <SmartImage src={mainImage(p)} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium leading-snug">{p.title}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">{p.category}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 font-medium tabular-nums">{money(pr.price)}</span>
                      <Badge tone={st.tone}>{st.key === 'in' ? `${p.stock} in stock` : st.label}</Badge>
                      <Badge tone={statusTone[p.status] || 'muted'} className="capitalize">{p.status}</Badge>
                    </div>
                    {actions(p)}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {editing !== undefined && <ProductForm product={editing} onClose={() => setEditing(undefined)} onSaved={reload} />}
      {bulk && <BulkUpload onClose={() => setBulk(false)} onDone={reload} />}
      <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} onConfirm={confirmDelete} loading={deleting} confirmLabel="Delete product" confirmIcon={Trash2}
        title="Delete this product?" message={removing ? `“${removing.title}” will be removed from the store permanently.` : ''} />
    </>
  );
}
