import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, ShoppingBag, Store, Trash2, Truck } from 'lucide-react';
import Button, { IconButton } from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { EmptyState, QtyStepper, Skeleton } from '@/components/ui/Bits';
import { useCart } from '@/context/CartContext';
import { BRAND } from '@/config/brand';
import { mainImage, money, priceOf } from '@/lib/helpers';

export function OrderSummaryRows({ subtotal, shipping, total }) {
  return (
    <dl className="space-y-3 text-[15px]">
      <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{shipping == null ? 'Chosen at checkout' : money(shipping)}</dd></div>
      <div className="flex justify-between border-t border-line pt-4 text-lg font-semibold"><dt>Total</dt><dd className="font-display tabular-nums">{money(total)}</dd></div>
    </dl>
  );
}

export default function Cart() {
  const { items, loading, subtotal, count, changeQty, remove } = useCart();

  if (loading && items.length === 0) {
    return <div className="container-x space-y-4 py-10">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 !rounded-3xl" />)}</div>;
  }
  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Add a few favourites and they’ll wait for you here." action={<Button to="/shop" icon={Store}>Start shopping</Button>} />
      </div>
    );
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Your cart</h1>
      <p className="mt-1.5 text-muted">{count} {count === 1 ? 'item' : 'items'}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start xl:grid-cols-[1fr_26rem]">
        <ul className="space-y-3">
          {items.map((it) => {
            const p = priceOf(it.product);
            const href = `/product/${encodeURIComponent(it.product.slug || it.product._id)}`;
            return (
              <li key={it._id} className="panel flex gap-3 p-3 xs:gap-4 xs:p-4">
                <Link to={href} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface2 sm:h-28 sm:w-28">
                  <SmartImage src={mainImage(it.product)} alt={it.product.title} className="h-full w-full object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted">{it.product.category}</p>
                      <Link to={href} className="line-clamp-2 font-medium leading-snug hover:text-brand">{it.product.title}</Link>
                    </div>
                    <IconButton icon={Trash2} label={`Remove ${it.product.title}`} size={40} onClick={() => remove(it)} className="-mr-1 -mt-1 text-muted hover:!text-danger" />
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                    <QtyStepper size="sm" value={it.quantity} max={it.product.stock} onChange={(d) => changeQty(it, d)} />
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold tabular-nums">{money(p.price * it.quantity)}</p>
                      {it.quantity > 1 && <p className="text-xs text-muted tabular-nums">{money(p.price)} each</p>}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="panel p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="mb-5 font-display text-2xl font-semibold">Order summary</h2>
          <OrderSummaryRows subtotal={subtotal} total={subtotal} />
          <p className="mt-4 flex items-start gap-2 text-sm text-muted"><Truck size={16} className="mt-0.5 shrink-0" />Delivery from {money(BRAND.shippingOptions[0].fee)}, calculated at checkout.</p>
          <Button to="/checkout" size="lg" full icon={CreditCard} className="mt-6">Checkout</Button>
          <Button to="/shop" variant="ghost" full icon={ArrowRight} iconPosition="right" className="mt-2">Continue shopping</Button>
        </aside>
      </div>
    </div>
  );
}
