import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { BRAND } from '@/config/brand';
import { useCatalog } from '@/context/CatalogContext';

export default function Footer() {
  const { categories } = useCatalog();
  const col = 'space-y-2.5 text-[15px] text-muted [&_a:hover]:text-brand';
  const head = 'mb-4 font-display text-base font-semibold text-ink';
  return (
    <footer className="mt-20 border-t border-line bg-surface/50">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-[15px] text-muted">Food, grooming, play and comfort for dogs, cats, birds and every small friend — chosen with care, delivered to your door.</p>
        </div>
        <div>
          <h3 className={head}>Shop</h3>
          <ul className={col}>
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop?sale=1">Deals</Link></li>
            {categories.slice(0, 4).map((c) => <li key={c}><Link to={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className={head}>Your account</h3>
          <ul className={col}>
            <li><Link to="/account">Profile</Link></li>
            <li><Link to="/account/orders">Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h3 className={head}>Contact</h3>
          <ul className={col}>
            <li className="flex items-start gap-2.5"><Mail size={17} className="mt-0.5 shrink-0" /><a href={`mailto:${BRAND.supportEmail}`} className="break-all">{BRAND.supportEmail}</a></li>
            <li className="flex items-start gap-2.5"><Phone size={17} className="mt-0.5 shrink-0" /><a href={`tel:${BRAND.supportPhone.replace(/\s/g, '')}`}>{BRAND.supportPhone}</a></li>
            <li className="flex items-start gap-2.5"><MapPin size={17} className="mt-0.5 shrink-0" />{BRAND.city}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-start justify-between gap-2 py-5 text-sm text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-brand" />Payments secured by aamarPay</p>
        </div>
      </div>
    </footer>
  );
}
