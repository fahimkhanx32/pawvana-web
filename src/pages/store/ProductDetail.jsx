import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Barcode, ChevronRight, Clock, Heart, PackageSearch, ShoppingBag, Store, Truck, Zap } from 'lucide-react';
import Button, { IconButton } from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { Badge, EmptyState, Price, QtyStepper, Skeleton } from '@/components/ui/Bits';
import { ProductGrid } from '@/components/shop/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { useWishlist } from '@/context/WishlistContext';
import { productApi } from '@/lib/api';
import { BRAND } from '@/config/brand';
import { cx, fmtDate, imageUrl, money, priceOf, stockState } from '@/lib/helpers';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const { products } = useCatalog();
  const { addToCart, busy } = useCart();
  const wish = useWishlist();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | missing
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    let live = true;
    setStatus('loading');
    setQty(1);
    setTab('description');
    productApi.bySlug(slug)
      .then((d) => {
        if (!live) return;
        if (d.product.status !== 'active' && !isStaff) { setStatus('missing'); return; }
        setProduct(d.product);
        setActive(Math.max(0, d.isMain || 0));
        setStatus('ready');
      })
      .catch(() => live && setStatus('missing'));
    return () => { live = false; };
  }, [slug, isStaff]);

  if (status === 'loading') {
    return (
      <div className="container-x grid gap-8 py-8 lg:grid-cols-2 lg:py-12">
        <Skeleton className="aspect-square !rounded-4xl" />
        <div className="space-y-4"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-12 w-4/5" /><Skeleton className="h-10 w-1/3" /><Skeleton className="h-28 w-full" /></div>
      </div>
    );
  }
  if (status === 'missing') {
    return (
      <div className="container-x py-20">
        <EmptyState icon={PackageSearch} title="We couldn’t find that product" text="It may have been removed or is no longer available." action={<Button to="/shop" icon={Store}>Back to shop</Button>} />
      </div>
    );
  }

  const p = priceOf(product);
  const st = stockState(product.stock);
  const images = product.images || [];
  const liked = wish.has(product._id);
  const related = products.filter((x) => x.category === product.category && x._id !== product._id).slice(0, 4);
  const maxQty = Math.max(1, Number(product.stock || 1));
  const offerEnds = p.hasDiscount && product.discountEndDate ? fmtDate(product.discountEndDate) : null;

  const buyNow = async () => { if (await addToCart(product, qty)) navigate('/cart'); };
  const tabs = [
    { id: 'description', label: 'Description', body: product.description },
    { id: 'info', label: 'Additional info', body: product.additionalInfo },
    { id: 'details', label: 'Details' },
  ];

  return (
    <div className="container-x py-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link to="/shop" className="hover:text-brand">Shop</Link><ChevronRight size={14} />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand">{product.category}</Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-4xl bg-surface2">
            <SmartImage src={imageUrl(images[active]?.url)} alt={product.title} className="h-full w-full object-cover" />
            {p.hasDiscount && <Badge className="absolute left-4 top-4 !bg-accent !text-[#2b1a04]">−{p.percentOff}% off</Badge>}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Product photos">
              {images.map((im, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={`Photo ${i + 1}`} onClick={() => setActive(i)}
                  className={cx('h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-2 transition', i === active ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100')}>
                  <SmartImage src={imageUrl(im.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && <Badge tone="muted">{product.brand}</Badge>}
            <Badge tone={st.tone}>{st.label}</Badge>
            {product.status !== 'active' && <Badge tone="accent">Preview · {product.status}</Badge>}
          </div>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] sm:text-5xl">{product.title}</h1>
          <Price product={product} size="lg" className="mt-4" />
          {offerEnds && <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted"><Clock size={15} />Offer ends {offerEnds}</p>}
          {product.shortDescription && <p className="mt-5 max-w-xl text-[17px] text-muted">{product.shortDescription}</p>}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} max={maxQty} disabled={st.key === 'out'} onChange={(d) => setQty((q) => Math.min(maxQty, Math.max(1, q + d)))} />
            <Button size="lg" icon={ShoppingBag} loading={busy === product._id} disabled={st.key === 'out'} onClick={() => addToCart(product, qty)} className="min-w-0 flex-1 xs:flex-none xs:min-w-[11rem]">
              {st.key === 'out' ? 'Sold out' : 'Add to cart'}
            </Button>
            <IconButton icon={Heart} label={liked ? 'Remove from wishlist' : 'Save to wishlist'} variant="quiet" size={56} onClick={() => wish.toggle(product._id)} className={liked ? '[&_svg]:fill-danger [&_svg]:text-danger' : ''} />
          </div>
          <Button variant="outline" size="lg" full icon={Zap} disabled={st.key === 'out'} onClick={buyNow} className="mt-3">Buy now</Button>

          <ul className="mt-7 space-y-3 rounded-3xl border border-line bg-surface/60 p-5 text-[15px]">
            <li className="flex items-start gap-3"><Truck size={19} className="mt-0.5 shrink-0 text-brand" /><span>Delivery {money(BRAND.shippingOptions[0].fee)} inside Dhaka · {money(BRAND.shippingOptions[1].fee)} outside</span></li>
            <li className="flex items-start gap-3"><Barcode size={19} className="mt-0.5 shrink-0 text-brand" /><span className="break-all text-muted">SKU {product.sku}</span></li>
          </ul>
        </div>
      </div>

      <section className="mt-12 sm:mt-16">
        <div className="flex gap-1 overflow-x-auto border-b border-line no-scrollbar" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)}
              className={cx('-mb-px shrink-0 border-b-2 px-4 py-3 text-[15px] transition', tab === t.id ? 'border-brand font-medium text-brand' : 'border-transparent text-muted hover:text-ink')}>
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="max-w-3xl py-6 text-[16px] leading-relaxed">
          {tab === 'details' ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
              <dt className="text-muted">Category</dt><dd>{product.category}</dd>
              {product.brand && <><dt className="text-muted">Brand</dt><dd>{product.brand}</dd></>}
              <dt className="text-muted">SKU</dt><dd className="break-all">{product.sku}</dd>
              {product.tag?.filter(Boolean).length > 0 && <><dt className="text-muted">Tags</dt><dd className="flex flex-wrap gap-1.5">{product.tag.filter(Boolean).map((t) => <Badge key={t}>{t.trim()}</Badge>)}</dd></>}
            </dl>
          ) : (
            <p className="whitespace-pre-line text-muted">{tabs.find((t) => t.id === tab).body || 'Nothing added yet.'}</p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10 sm:mt-14">
          <h2 className="mb-6 font-display text-3xl font-semibold">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
