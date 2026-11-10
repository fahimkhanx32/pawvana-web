import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Heart, House, MailCheck, MailWarning, Package, ShoppingBag, UserRound } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { authApi } from '@/lib/api';
import { cx } from '@/lib/helpers';

function VerifyBanner() {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  if (!user || user.isVerified !== false) return null;

  const resend = async () => {
    setBusy(true);
    try { await authApi.resend(user.email); setSent(true); toast.success('Verification email sent. Check your inbox.'); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="border-b border-accent/30 bg-accent/15">
      <div className="container-x flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 text-sm">
        <MailWarning size={18} className="shrink-0" />
        <p className="min-w-0 flex-1">Please verify your email address to secure your account.</p>
        <Button size="sm" variant="quiet" icon={MailCheck} loading={busy} disabled={sent} onClick={resend}>{sent ? 'Email sent' : 'Resend email'}</Button>
      </div>
    </div>
  );
}

function TabBar() {
  const { count } = useCart();
  const wish = useWishlist();
  const { isAuthed } = useAuth();
  const items = [
    { to: '/', label: 'Home', icon: House, end: true },
    { to: '/shop', label: 'Shop', icon: Package },
    { to: '/wishlist', label: 'Saved', icon: Heart, badge: wish.ids.length },
    { to: '/cart', label: 'Cart', icon: ShoppingBag, badge: count },
    { to: isAuthed ? '/account' : '/login', label: isAuthed ? 'Account' : 'Sign in', icon: UserRound },
  ];
  return (
    <nav aria-label="Primary" className="safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={label}>
            <NavLink to={to} end={end} className={({ isActive }) => cx('relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition', isActive ? 'text-brand' : 'text-muted')}>
              {({ isActive }) => (
                <>
                  <span className={cx('absolute top-0 h-1 w-8 rounded-b-full bg-brand transition-opacity', isActive ? 'opacity-100' : 'opacity-0')} />
                  <span className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    {badge > 0 && <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-[#2b1a04]">{badge > 99 ? '99+' : badge}</span>}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function StoreLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <VerifyBanner />
      <main className="flex-1"><Outlet /></main>
      <div className="pb-16 md:pb-0"><Footer /></div>
      <TabBar />
    </div>
  );
}
