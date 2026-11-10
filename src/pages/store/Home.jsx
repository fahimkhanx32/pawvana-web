import { Link } from 'react-router-dom';
import { BadgePercent, Bird, Cat, Dog, Headset, LayoutDashboard, PackageSearch, RotateCcw, ShieldCheck, ShoppingBag, Truck, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { EmptyState, SectionHeading } from '@/components/ui/Bits';
import { ProductGrid, ProductGridSkeleton } from '@/components/shop/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { useAuth } from '@/context/AuthContext';
import { BRAND } from '@/config/brand';
import { categoryIcon, cx, mainImage, money, priceOf } from '@/lib/helpers';

const fallbackArches = [Dog, Cat, Bird];

function Hero({ picks, categories }) {
  // Three arches: tall in the middle. They show real products when the catalogue has any.
  const slots = [
    { h: 'h-[68%]', tone: 'bg-brand-soft text-brand', delay: '.15s' },
    { h: 'h-full', tone: 'bg-brand text-brand-ink', delay: '.3s' },
    { h: 'h-[80%]', tone: 'bg-accent text-[#2b1a04]', delay: '.45s' },
  ];
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_85%_0%,rgb(var(--brand-soft)),transparent)]" />
      <div className="container-x relative grid items-center gap-8 pb-12 pt-8 sm:pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:pb-20 lg:pt-16">
        <div className="min-w-0">
          <h1 className="text-[40px] font-semibold leading-[1.02] xs:text-[46px] sm:text-6xl lg:text-[76px]">
            Considered care for every kind of companion.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
            Food, grooming, play and comfort for dogs, cats, birds and the small ones too — chosen with care and delivered to your door.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/shop" size="lg" icon={ShoppingBag}>Shop all</Button>
            <Button to="/shop?sale=1" size="lg" variant="quiet" icon={BadgePercent}>Today’s deals</Button>
          </div>

          {categories.length > 0 && (
            <div className="mt-8">
              <p className="mb-2.5 text-sm text-muted">Shop by pet</p>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
                {categories.slice(0, 6).map((c) => {
                  const Icon = categoryIcon(c);
                  return (
                    <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-2.5 text-[15px] backdrop-blur transition hover:border-brand hover:text-brand">
                      <Icon size={17} className="text-brand" />{c}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto flex h-[300px] w-full max-w-[560px] items-end gap-2.5 xs:h-[340px] sm:h-[460px] sm:gap-4 lg:h-[540px]" aria-label="Featured products">
          {slots.map((s, i) => {
            const p = picks[i];
            const Fallback = fallbackArches[i];
            const body = p ? (
              <>
                <SmartImage src={mainImage(p)} alt={p.title} icon={Fallback} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-x-2 bottom-2 hidden rounded-2xl bg-surface/90 p-2.5 text-ink backdrop-blur sm:block">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-sm text-muted tabular-nums">{money(priceOf(p).price)}</p>
                </div>
              </>
            ) : (
              <Fallback size={56} strokeWidth={1.1} className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:h-20 sm:w-20" aria-hidden />
            );
            const cls = cx('arch relative min-w-0 flex-1 animate-rise overflow-hidden shadow-lift', s.h, s.tone);
            return p ? (
              <Link key={i} to={`/product/${encodeURIComponent(p.slug || p._id)}`} className={cls} style={{ animationDelay: s.delay }}>{body}</Link>
            ) : (
              <div key={i} className={cls} style={{ animationDelay: s.delay }} aria-hidden>{body}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryRow({ categories }) {
  if (!categories.length) return null;
  return (
    <section className="container-x py-10 sm:py-14">
      <SectionHeading title="Shop by category" text="Everything sorted the way pet parents shop." to="/shop" />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:px-0 lg:grid-cols-6">
        {categories.slice(0, 12).map((c, i) => {
          const Icon = categoryIcon(c);
          return (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="group w-[7.25rem] shrink-0 snap-start text-center sm:w-auto">
              <span className={cx('arch grid aspect-[3/4] place-items-center transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift', i % 3 === 0 ? 'bg-brand-soft text-brand' : i % 3 === 1 ? 'bg-surface2 text-ink' : 'bg-accent/25 text-ink')}>
                <Icon size={34} strokeWidth={1.3} />
              </span>
              <span className="mt-3 block truncate px-1 text-[15px] font-medium">{c}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const promises = [
  { icon: Truck, title: 'Delivery across Bangladesh', text: 'Inside and outside Dhaka, straight to your door.' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Pay safely online through aamarPay.' },
  { icon: Headset, title: 'Friendly support', text: `Questions? Write to ${BRAND.supportEmail}.` },
];

export default function Home() {
  const { products, categories, bySection, loading, error, reload } = useCatalog();
  const { isAuthed, isStaff } = useAuth();

  const newest = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const deals = bySection('deals');
  const featured = bySection('feature');
  const fresh = bySection('new');
  const picks = [...featured, ...deals, ...fresh, ...newest].filter((p, i, a) => mainImage(p) && a.indexOf(p) === i).slice(0, 3);

  if (error) {
    return (
      <div className="container-x py-24">
        <EmptyState icon={PackageSearch} title="We can’t reach the store" text={error} action={<Button icon={RotateCcw} onClick={reload}>Try again</Button>} />
      </div>
    );
  }

  return (
    <>
      <Hero picks={picks} categories={categories} />
      <CategoryRow categories={categories} />

      {loading ? (
        <section className="container-x py-8"><ProductGridSkeleton n={4} /></section>
      ) : products.length === 0 ? (
        <section className="container-x py-10">
          <EmptyState
            icon={PackageSearch}
            title="The shelves are being stocked"
            text="New products will appear here as soon as they’re published."
            action={isStaff ? <Button to="/admin/products" icon={LayoutDashboard}>Add products</Button> : <Button to="/shop" icon={ShoppingBag}>Browse the shop</Button>}
          />
        </section>
      ) : (
        <>
          {deals.length > 0 && (
            <section className="container-x py-8 sm:py-12">
              <SectionHeading title="Deals worth wagging about" to="/shop?sale=1" />
              <ProductGrid products={deals.slice(0, 8)} />
            </section>
          )}
          <section className="container-x py-8 sm:py-12">
            <SectionHeading title={featured.length ? 'Featured picks' : 'Latest arrivals'} text="Hand-picked favourites from our shelves." to="/shop" />
            <ProductGrid products={(featured.length ? featured : newest).slice(0, 8)} />
          </section>
          {fresh.length > 0 && (
            <section className="container-x py-8 sm:py-12">
              <SectionHeading title="New this week" to="/shop?sort=new" />
              <ProductGrid products={fresh.slice(0, 4)} />
            </section>
          )}
        </>
      )}

      <section className="container-x py-10 sm:py-14">
        <div className="panel grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          {promises.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon size={22} /></span>
              <div className="min-w-0"><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-[15px] text-muted">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {!isAuthed && (
        <section className="container-x pb-6 pt-2">
          <div className="relative overflow-hidden rounded-5xl bg-brand p-8 text-brand-ink sm:p-12">
            <div aria-hidden className="arch absolute -bottom-10 right-8 hidden h-56 w-40 bg-white/10 sm:block" />
            <div aria-hidden className="arch absolute -bottom-16 right-52 hidden h-44 w-32 bg-white/10 md:block" />
            <h2 className="max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">Make every order a little easier.</h2>
            <p className="mt-3 max-w-md opacity-85">Create a free account to keep your cart, track orders and check out in seconds.</p>
            <Button to="/register" variant="quiet" size="lg" icon={UserPlus} className="mt-6 !border-transparent !text-ink">Create account</Button>
          </div>
        </section>
      )}
    </>
  );
}
