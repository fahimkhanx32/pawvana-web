import { Link } from 'react-router-dom';
import { Heart, LoaderCircle, ShoppingBag } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { Badge, Price } from '@/components/ui/Bits';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cx, mainImage, priceOf, stockState } from '@/lib/helpers';

export default function ProductCard({ product }) {
  const { addToCart, busy } = useCart();
  const wish = useWishlist();
  const p = priceOf(product);
  const out = stockState(product.stock).key === 'out';
  const liked = wish.has(product._id);
  const href = `/product/${encodeURIComponent(product.slug || product._id)}`;

  return (
    <article className="group relative flex min-w-0 flex-col">
      <Link to={href} className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-surface2" aria-label={product.title}>
        <SmartImage
          src={mainImage(product)}
          alt={product.title}
          className={cx('h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]', out && 'opacity-60 grayscale-[.4]')}
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {p.hasDiscount && <Badge tone="accent" className="!bg-accent !text-[#2b1a04]">−{p.percentOff}%</Badge>}
          {out && <Badge tone="ink">Sold out</Badge>}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => wish.toggle(product._id)}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
        className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-surface/85 text-ink shadow-soft backdrop-blur transition active:scale-90"
      >
        <Heart size={18} className={liked ? 'fill-danger text-danger' : ''} />
      </button>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="truncate text-xs text-muted">{product.category}{product.brand ? ` · ${product.brand}` : ''}</p>
        <Link to={href} className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-[15px] font-medium leading-snug hover:text-brand">{product.title}</Link>
        <div className="mt-2 flex items-end justify-between gap-2">
          <Price product={product} />
          <button
            type="button"
            disabled={out || busy === product._id}
            onClick={() => addToCart(product, 1)}
            aria-label={`Add ${product.title} to cart`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-brand-ink shadow-soft transition hover:brightness-110 active:scale-90 disabled:opacity-40"
          >
            {busy === product._id ? <LoaderCircle size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, className }) {
  return (
    <div className={cx('grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4', className)}>
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}

export function ProductGridSkeleton({ n = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5] rounded-3xl" />
          <div className="skeleton mt-3 h-3 w-1/3 rounded-full" />
          <div className="skeleton mt-2 h-4 w-4/5 rounded-full" />
          <div className="skeleton mt-3 h-5 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}
