import { useMemo, useRef, useState } from 'react';
import { AlignLeft, Banknote, BadgePercent, Boxes, CalendarDays, FileText, ImagePlus, Layers, Percent, Save, Shapes, Sparkles, Star, StickyNote, Store, Tags, Type, X } from 'lucide-react';
import Sheet from '@/components/ui/Sheet';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import { productApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCatalog } from '@/context/CatalogContext';
import { cx, imageUrl } from '@/lib/helpers';

const MAX_IMAGES = 5;
const statusOpts = [
  { value: 'active', label: 'Active — visible in store' },
  { value: 'pending', label: 'Pending — hidden' },
  { value: 'inactive', label: 'Inactive — hidden' },
];
const sectionOpts = [
  { value: 'none', label: 'None' },
  { value: 'deals', label: 'Deals' },
  { value: 'feature', label: 'Featured' },
  { value: 'new', label: 'New arrival' },
];
const discountOpts = [
  { value: 'none', label: 'No discount' },
  { value: 'percent', label: 'Percentage (%)' },
  { value: 'flat', label: 'Flat amount' },
];
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const today = () => new Date().toISOString().slice(0, 10);

export default function ProductForm({ product, onClose, onSaved }) {
  const editing = !!product;
  const toast = useToast();
  const { adminCategories, all } = useCatalog();
  const fileRef = useRef(null);

  const categories = useMemo(() => {
    const s = new Set([...adminCategories, ...all.map((p) => p.category)].filter(Boolean));
    if (product?.category) s.add(product.category);
    return [...s].map((c) => ({ value: c, label: c }));
  }, [adminCategories, all, product]);

  const [f, setF] = useState({
    title: product?.title || '', category: product?.category || '', brand: product?.brand || '',
    price: product?.price ?? '', stock: product?.stock ?? '',
    status: product?.status || 'active', section: product?.section || 'none',
    discountType: product?.discountType || 'none', discount: product?.discount ?? '',
    discountStartDate: day(product?.discountStartDate), discountEndDate: day(product?.discountEndDate),
    shortDescription: product?.shortDescription || '', description: product?.description || '',
    additionalInfo: product?.additionalInfo || '', tag: (product?.tag || []).filter(Boolean).join(', '),
  });
  // existing images keep their original index (the backend deletes / flags by index)
  const [olds, setOlds] = useState((product?.images || []).map((im, idx) => ({ idx, url: im.url, removed: false })));
  const [news, setNews] = useState([]); // { file, preview }
  const initialMain = Math.max(0, (product?.images || []).findIndex((i) => i.isMain));
  const [main, setMain] = useState({ kind: 'old', i: product?.images?.length ? initialMain : 0 });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const keptCount = olds.filter((o) => !o.removed).length + news.length;

  const addFiles = (list) => {
    const imgs = [...list].filter((x) => x.type.startsWith('image/'));
    const room = MAX_IMAGES - keptCount;
    if (imgs.length > room) toast.info(`Only ${MAX_IMAGES} images per product — extra files were skipped.`);
    const add = imgs.slice(0, Math.max(0, room)).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (!add.length) return;
    setNews((n) => [...n, ...add]);
    if (keptCount === 0) setMain({ kind: 'new', i: 0 });
  };
  const removeOld = (i) => {
    setOlds((s) => s.map((o, k) => (k === i ? { ...o, removed: true } : o)));
    if (main.kind === 'old' && main.i === i) {
      const nextOld = olds.findIndex((o, k) => k !== i && !o.removed);
      setMain(nextOld >= 0 ? { kind: 'old', i: nextOld } : news.length ? { kind: 'new', i: 0 } : { kind: 'old', i: 0 });
    }
  };
  const removeNew = (i) => {
    setNews((s) => s.filter((_, k) => k !== i));
    if (main.kind === 'new') {
      if (main.i === i) {
        const firstOld = olds.findIndex((o) => !o.removed);
        setMain(firstOld >= 0 ? { kind: 'old', i: firstOld } : { kind: 'new', i: 0 });
      } else if (main.i > i) setMain({ kind: 'new', i: main.i - 1 });
    }
  };

  const validate = () => {
    const n = {};
    if (f.title.trim().length < 2) n.title = 'Give the product a name';
    if (!f.category) n.category = 'Choose a category';
    if (!(Number(f.price) > 0)) n.price = 'Enter a price above 0';
    if (f.stock === '' || Number(f.stock) < 0 || !Number.isInteger(Number(f.stock))) n.stock = 'Enter a whole number';
    else if (!editing && Number(f.stock) < 1) n.stock = 'New products need at least 1 in stock';
    if (f.discountType !== 'none') {
      const d = Number(f.discount);
      if (!(d > 0)) n.discount = 'Enter the discount amount';
      else if (f.discountType === 'percent' && d > 100) n.discount = 'A percentage can’t exceed 100';
      else if (f.discountType === 'flat' && d >= Number(f.price)) n.discount = 'Must be lower than the price';
      if (!editing) {
        if (f.discountStartDate && f.discountStartDate < today()) n.discountStartDate = 'Can’t start in the past';
        if (f.discountEndDate && f.discountEndDate < today()) n.discountEndDate = 'Can’t end in the past';
      }
      if (f.discountStartDate && f.discountEndDate && f.discountEndDate < f.discountStartDate) n.discountEndDate = 'End must be after start';
    }
    if (!editing && keptCount === 0) n.images = 'Add at least one photo';
    if (keptCount > MAX_IMAGES) n.images = `At most ${MAX_IMAGES} photos`;
    return n;
  };

  const submit = async (e) => {
    e.preventDefault();
    const n = validate();
    setErrors(n);
    if (Object.keys(n).length) { toast.error('Please fix the highlighted fields.'); return; }

    const fd = new FormData();
    ['title', 'category', 'brand', 'status', 'section', 'shortDescription', 'description', 'additionalInfo'].forEach((k) => fd.append(k, String(f[k] ?? '').trim()));
    fd.append('price', String(Number(f.price)));
    fd.append('stock', String(Number(f.stock)));
    fd.append('discountType', f.discountType);
    fd.append('discount', f.discountType === 'none' ? '0' : String(Number(f.discount)));
    if (f.discountType !== 'none') {
      if (f.discountStartDate) fd.append('discountStartDate', f.discountStartDate);
      if (f.discountEndDate) fd.append('discountEndDate', f.discountEndDate);
    }
    const tags = f.tag.split(',').map((t) => t.trim()).filter(Boolean);
    if (editing) tags.forEach((t) => fd.append('tag', t)); // update stores whatever array it receives
    else fd.append('tag', tags.join(',')); // create splits a comma string itself
    news.forEach((x) => fd.append('images', x.file));

    // index into the backend's combined array: [all existing images…, new uploads…]
    const mainIndex = main.kind === 'old' ? (olds[main.i]?.idx ?? 0) : olds.length + main.i;
    fd.append('isMain', String(mainIndex));
    if (editing) fd.append('deleteImage', olds.filter((o) => o.removed).map((o) => o.idx).join(','));

    setSaving(true);
    try {
      if (editing) await productApi.update(product._id, fd); else await productApi.create(fd);
      toast.success(editing ? 'Product updated' : 'Product created');
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Thumb = ({ src, isMain, onMain, onRemove, label }) => (
    <li className={cx('group relative aspect-square overflow-hidden rounded-2xl border-2 bg-surface2', isMain ? 'border-brand' : 'border-transparent')}>
      <img src={src} alt={label} className="h-full w-full object-cover" />
      <button type="button" onClick={onMain} aria-label="Set as main photo" aria-pressed={isMain}
        className={cx('absolute left-1 top-1 grid h-8 w-8 place-items-center rounded-full shadow-soft', isMain ? 'bg-accent text-[#2b1a04]' : 'bg-surface/90 text-ink')}>
        <Star size={15} className={isMain ? 'fill-current' : ''} />
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove photo" className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-surface/90 text-danger shadow-soft"><X size={15} /></button>
    </li>
  );

  return (
    <Sheet
      open
      onClose={onClose}
      title={editing ? 'Edit product' : 'Add product'}
      subtitle={editing ? product.sku : 'It appears in the store once its status is Active.'}
      icon={Store}
      width="sm:max-w-2xl"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="quiet" icon={X} onClick={onClose}>Cancel</Button>
          <Button type="submit" form="product-form" icon={Save} loading={saving}>{editing ? 'Save changes' : 'Create product'}</Button>
        </div>
      }
    >
      <form id="product-form" onSubmit={submit} noValidate className="space-y-8 p-5 sm:p-6">
        <fieldset className="space-y-5">
          <legend className="mb-4 font-display text-lg font-semibold">Basics</legend>
          <FloatField icon={Type} label="Product name" value={f.title} onChange={set('title')} error={errors.title} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FloatField icon={Shapes} label="Category" select placeholder="Choose category" options={categories} value={f.category} onChange={set('category')} error={errors.category} helperText={categories.length ? undefined : 'Create a category first'} />
            <FloatField icon={Store} label="Brand (optional)" value={f.brand} onChange={set('brand')} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FloatField icon={Banknote} label="Price" type="number" inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }} value={f.price} onChange={set('price')} error={errors.price} />
            <FloatField icon={Boxes} label="Stock" type="number" inputProps={{ min: 0, step: 1, inputMode: 'numeric' }} value={f.stock} onChange={set('stock')} error={errors.stock} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FloatField icon={Layers} label="Status" select options={statusOpts} value={f.status} onChange={set('status')} />
            <FloatField icon={Sparkles} label="Homepage section" select options={sectionOpts} value={f.section} onChange={set('section')} />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-4 font-display text-lg font-semibold">Discount</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FloatField icon={BadgePercent} label="Discount type" select options={discountOpts} value={f.discountType} onChange={set('discountType')} />
            {f.discountType !== 'none' && <FloatField icon={Percent} label={f.discountType === 'percent' ? 'Percent off' : 'Amount off'} type="number" inputProps={{ min: 0, step: '0.01' }} value={f.discount} onChange={set('discount')} error={errors.discount} />}
          </div>
          {f.discountType !== 'none' && (
            <div className="grid gap-5 sm:grid-cols-2">
              <FloatField icon={CalendarDays} label="Starts (optional)" type="date" value={f.discountStartDate} onChange={set('discountStartDate')} error={errors.discountStartDate} />
              <FloatField icon={CalendarDays} label="Ends (optional)" type="date" value={f.discountEndDate} onChange={set('discountEndDate')} error={errors.discountEndDate} />
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-4 font-display text-lg font-semibold">Details</legend>
          <FloatField icon={AlignLeft} label="Short description" value={f.shortDescription} onChange={set('shortDescription')} />
          <FloatField icon={FileText} label="Description" multiline minRows={4} value={f.description} onChange={set('description')} />
          <FloatField icon={StickyNote} label="Additional information" multiline minRows={3} value={f.additionalInfo} onChange={set('additionalInfo')} />
          <FloatField icon={Tags} label="Tags" placeholder="dog, grain-free, puppy" helperText="Separate with commas." value={f.tag} onChange={set('tag')} />
        </fieldset>

        <fieldset>
          <legend className="mb-1 font-display text-lg font-semibold">Photos</legend>
          <p className="mb-4 text-sm text-muted">Up to {MAX_IMAGES}. Tap the star to choose the main photo.</p>
          <ul className="mb-4 grid grid-cols-3 gap-3 xs:grid-cols-4 sm:grid-cols-5">
            {olds.map((o, i) => !o.removed && (
              <Thumb key={`o${o.idx}`} src={imageUrl(o.url)} label="Existing photo" isMain={main.kind === 'old' && main.i === i} onMain={() => setMain({ kind: 'old', i })} onRemove={() => removeOld(i)} />
            ))}
            {news.map((n, i) => (
              <Thumb key={n.preview} src={n.preview} label="New photo" isMain={main.kind === 'new' && main.i === i} onMain={() => setMain({ kind: 'new', i })} onRemove={() => removeNew(i)} />
            ))}
          </ul>
          {keptCount < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
              className={cx('flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed px-4 py-8 text-center transition', drag ? 'border-brand bg-brand-soft' : errors.images ? 'border-danger' : 'border-line hover:bg-surface2')}
            >
              <ImagePlus size={28} className="text-brand" />
              <span className="font-medium">Add photos</span>
              <span className="text-sm text-muted">Drop images here or tap to browse</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          {errors.images && <p role="alert" className="mt-2 px-1 text-sm text-danger">{errors.images}</p>}
        </fieldset>
      </form>
    </Sheet>
  );
}
