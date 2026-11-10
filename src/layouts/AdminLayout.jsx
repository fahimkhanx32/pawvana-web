import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Package, ReceiptText, Store, Tags, Users } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Sheet from '@/components/ui/Sheet';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button, { IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Bits';
import { useAuth } from '@/context/AuthContext';
import { cx } from '@/lib/helpers';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText, adminOnly: true },
  { to: '/admin/customers', label: 'Customers', icon: Users, adminOnly: true },
];

function SideNav({ onNavigate }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6"><Logo to="/admin" /></div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
        {nav.filter((n) => !n.adminOnly || isAdmin).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) => cx('flex h-12 items-center gap-3 rounded-2xl px-4 text-[15px] transition', isActive ? 'bg-brand text-brand-ink shadow-soft' : 'text-ink hover:bg-surface2')}>
            <Icon size={19} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 border-t border-line p-4">
        <div className="flex items-center gap-3 px-1">
          <span className="grid h-11 w-10 shrink-0 place-items-center rounded-t-full rounded-b-xl bg-brand-soft font-display text-lg font-semibold text-brand">{(user.name || user.email).slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 flex-1"><p className="truncate font-medium leading-tight">{user.name}</p><Badge tone="brand" className="mt-1 capitalize">{user.role}</Badge></div>
        </div>
        <Button to="/" variant="quiet" full size="sm" icon={Store} onClick={onNavigate}>View store</Button>
        <Button variant="ghost" full size="sm" icon={LogOut} onClick={() => { logout(); navigate('/'); }}>Sign out</Button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17.5rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-surface/60 lg:block"><SideNav /></aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-bg/85 px-3 backdrop-blur-xl lg:hidden">
        <IconButton icon={Menu} label="Open menu" onClick={() => setOpen(true)} />
        <Logo to="/admin" className="mr-auto" />
        <ThemeToggle />
      </header>
      <Sheet open={open} onClose={() => setOpen(false)} side="left"><SideNav onNavigate={() => setOpen(false)} /></Sheet>

      <div className="min-w-0">
        <div className="hidden items-center justify-end gap-2 px-8 pt-5 lg:flex"><ThemeToggle variant="quiet" /></div>
        <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-3"><Outlet /></main>
      </div>
    </div>
  );
}

export function PageHeader({ title, text, children }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0"><h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>{text && <p className="mt-1 text-muted">{text}</p>}</div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
