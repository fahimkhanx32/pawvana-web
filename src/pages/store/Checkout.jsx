import { useEffect, useMemo, useState } from 'react';
import { Building2, CircleAlert, Hash, Landmark, Lock, Mail, MapPin, MapPinned, Phone, Store, Truck, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import SmartImage from '@/components/ui/SmartImage';
import { EmptyState } from '@/components/ui/Bits';
import { Alert } from '@/layouts/AuthLayout';
import { OrderSummaryRows } from './Cart';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/lib/api';
import { BRAND } from '@/config/brand';
import { cx, isEmail, isPhone, mainImage, money, priceOf } from '@/lib/helpers';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, loading } = useCart();
  const b = user.billingAddress || {};

  const [f, setF] = useState({
    name: b.fullName || user.name || '',
    email: b.email || user.email || '',
    phone: user.phone || b.phoneNumber || '',
    add1: user.address || b.street || '',
    add2: '',
    city: user.city || '',
    state: BRAND.divisions.includes(user.city) ? user.city : '',
    postcode: user.postalCode || b.zipCode || '',
  });
  const [ship, setShip] = useState(BRAND.shippingOptions[0].id);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [paying, setPaying] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  // Picking a division nudges the delivery zone, but the customer can still change it.
  useEffect(() => {
    if (f.state) setShip(f.state === 'Dhaka' ? 'dhaka' : 'outside');
  }, [f.state]);

  const shipping = useMemo(() => BRAND.shippingOptions.find((o) => o.id === ship), [ship]);
  const total = subtotal + shipping.fee;

  if (loading && !items.length) return null;
  if (!items.length) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={Store} title="Nothing to check out" text="Your cart is empty." action={<Button to="/shop" icon={Store}>Browse the shop</Button>} />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const n = {};
    if (f.name.trim().length < 2) n.name = 'Enter the recipient’s full name';
    if (!isEmail(f.email)) n.email = 'Enter a valid email address';
    if (!isPhone(f.phone)) n.phone = 'Enter a phone number we can reach';
    if (f.add1.trim().length < 5) n.add1 = 'Enter the street address';
    if (!f.city.trim()) n.city = 'Enter the city or area';
    if (!f.state) n.state = 'Choose a division';
    if (f.postcode.trim().length < 3) n.postcode = 'Enter the postal code';
    setErrors(n);
    setServerError('');
    if (Object.keys(n).length) { document.querySelector('[aria-invalid="true"]')?.focus(); return; }

    setPaying(true);
    try {
      const res = await orderApi.pay({
        userId: user._id,
        cus_name: f.name.trim(), cus_email: f.email.trim(), cus_phone: f.phone.trim(),
        cus_add1: f.add1.trim(), cus_add2: f.add2.trim() || 'N/A',
        cus_city: f.city.trim(), cus_state: f.state, cus_postcode: f.postcode.trim(),
        shipping: shipping.fee,
      });
      if (!res.payment_url) throw new Error('The payment gateway did not return a payment link. Please try again.');
      window.location.assign(res.payment_url);
    } catch (err) {
      setServerError(err.message);
      setPaying(false);
    }
  };

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Checkout</h1>
      <p className="mt-1.5 text-muted">Tell us where to deliver, then pay securely.</p>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
        <div className="space-y-6">
          <section className="panel space-y-5 p-5 sm:p-7">
            <h2 className="font-display text-2xl font-semibold">Contact</h2>
            <FloatField icon={User} label="Full name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FloatField icon={Mail} label="Email address" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
              <FloatField icon={Phone} label="Phone number" type="tel" autoComplete="tel" inputProps={{ inputMode: 'tel' }} value={f.phone} onChange={set('phone')} error={errors.phone} />
            </div>
          </section>

          <section className="panel space-y-5 p-5 sm:p-7">
            <h2 className="font-display text-2xl font-semibold">Delivery address</h2>
            <FloatField icon={MapPin} label="Street address" autoComplete="address-line1" placeholder="House, road, area" value={f.add1} onChange={set('add1')} error={errors.add1} />
            <FloatField icon={MapPinned} label="Apartment, landmark (optional)" autoComplete="address-line2" value={f.add2} onChange={set('add2')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FloatField icon={Building2} label="City / area" autoComplete="address-level2" value={f.city} onChange={set('city')} error={errors.city} />
              <FloatField icon={Landmark} label="Division" select placeholder="Choose division" options={BRAND.divisions.map((d) => ({ value: d, label: d }))} value={f.state} onChange={set('state')} error={errors.state} />
            </div>
            <FloatField icon={Hash} label="Postal code" autoComplete="postal-code" inputProps={{ inputMode: 'numeric' }} value={f.postcode} onChange={set('postcode')} error={errors.postcode} />
          </section>

          <section className="panel p-5 sm:p-7">
            <h2 className="font-display text-2xl font-semibold">Delivery</h2>
            <div role="radiogroup" aria-label="Delivery zone" className="mt-5 grid gap-3 sm:grid-cols-2">
              {BRAND.shippingOptions.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={ship === o.id} onClick={() => setShip(o.id)}
                  className={cx('flex items-center gap-3 rounded-3xl border p-4 text-left transition', ship === o.id ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:bg-surface2')}>
                  <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', ship === o.id ? 'bg-brand text-brand-ink' : 'bg-surface2 text-muted')}><Truck size={20} /></span>
                  <span className="min-w-0 flex-1"><span className="block font-medium">{o.label}</span><span className="block text-sm text-muted">{o.eta}</span></span>
                  <span className="font-semibold tabular-nums">{money(o.fee)}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="panel p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 font-display text-2xl font-semibold">Your order</h2>
          <ul className="mb-5 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((it) => (
              <li key={it._id} className="flex items-center gap-3">
                <span className="relative">
                  <SmartImage src={mainImage(it.product)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-xs text-bg">{it.quantity}</span>
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px]">{it.product.title}</span>
                <span className="text-[15px] tabular-nums">{money(priceOf(it.product).price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderSummaryRows subtotal={subtotal} shipping={shipping.fee} total={total} />
          {serverError && <div className="mt-5"><Alert icon={CircleAlert}>{serverError}</Alert></div>}
          <Button type="submit" size="lg" full icon={Lock} loading={paying} className="mt-6">Pay {money(total)} securely</Button>
          <p className="mt-3 text-center text-sm text-muted">You’ll be taken to aamarPay to complete payment.</p>
          <Button to="/cart" variant="ghost" full className="mt-1" icon={Store}>Edit cart</Button>
        </aside>
      </form>
    </div>
  );
}
