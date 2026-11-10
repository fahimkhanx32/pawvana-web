import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogIn, LogOut, ReceiptText, Search, ShoppingBag, UserPlus, UserRound } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button, { IconButton } from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchDialog from './SearchDialog';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cx } from '@/lib/helpers';

const links = [
  { to: '/shop', label: 'Shop', end: true },
  { to: '/shop?sale=1', label: 'Deals' },
  { to: '/shop?sort=new', label: 'New in' },
];

function AccountMenu() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => (e.type === 'keydown' ? e.key === 'Escape' && setOpen(false) : !ref.current?.contains(e.target) && setOpen(false));
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition hover:bg-surface2';
  const initials = (user.name || user.email || '?').trim().slice(0, 1).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft font-display text-lg font-semibold text-brand transition hover:brightness-95"
      >
        {initials}
      </button>
      {open && (
        <div role="menu" className="panel absolute right-0 top-[calc(100%+10px)] z-50 w-64 animate-pop !bg-surface p-2 shadow-lift">
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            <p className="truncate font-medium">{user.name || 'Welcome'}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
          <div className="pt-1.5">
            <Link role="menuitem" to="/account" onClick={() => setOpen(false)} className={item}><UserRound size={18} className="text-muted" />My profile</Link>
            <Link role="menuitem" to="/account/orders" onClick={() => setOpen(false)} className={item}><ReceiptText size={18} className="text-muted" />My orders</Link>
            {isStaff && <Link role="menuitem" to="/admin" onClick={() => setOpen(false)} className={item}><LayoutDashboard size={18} className="text-muted" />Dashboard</Link>}
            <button role="menuitem" type="button" className={cx(item, 'text-danger')} onClick={() => { setOpen(false); logout(); navigate('/'); }}>
              <LogOut size={18} />Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { isAuthed } = useAuth();
  const { count } = useCart();
  const wish = useWishlist();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) { e.preventDefault(); setSearching(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="container-x flex h-[68px] items-center gap-2 md:h-[76px] md:gap-4">
          <Logo className="mr-auto md:mr-2" />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} end={l.end} className={({ isActive }) => cx('rounded-full px-4 py-2 text-[15px] transition hover:bg-surface2', isActive && l.end && 'font-medium text-brand')}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setSearching(true)}
            className="ml-auto hidden h-11 w-72 items-center gap-3 rounded-full border border-line bg-surface/70 px-4 text-left text-[15px] text-muted transition hover:bg-surface lg:flex xl:w-96"
          >
            <Search size={18} />
            <span className="flex-1 truncate">Search products</span>
            <kbd className="rounded-md border border-line px-1.5 text-xs">/</kbd>
          </button>

          <div className="flex items-center gap-0.5 xs:gap-1">
            <IconButton icon={Search} label="Search products" onClick={() => setSearching(true)} className="lg:hidden" />
            <ThemeToggle />
            <IconButton icon={Heart} label="Wishlist" to="/wishlist" badge={wish.ids.length} className="hidden md:grid" />
            <IconButton icon={ShoppingBag} label="Cart" to="/cart" badge={count} />
            <div className="ml-1 hidden items-center gap-2 md:flex">
              {isAuthed ? (
                <AccountMenu />
              ) : (
                <>
                  <Button to="/login" variant="quiet" size="sm" icon={LogIn}>Sign in</Button>
                  <Button to="/register" size="sm" icon={UserPlus}>Join</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <SearchDialog open={searching} onClose={() => setSearching(false)} />
    </>
  );
}
