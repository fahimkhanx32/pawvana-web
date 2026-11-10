import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BadgeCheck, LayoutDashboard, LogOut, MailWarning, ReceiptText, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Bits';
import { useAuth } from '@/context/AuthContext';
import { cx } from '@/lib/helpers';

export default function AccountShell() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const tabs = [
    { to: '/account', label: 'Profile', icon: UserRound, end: true },
    { to: '/account/orders', label: 'Orders', icon: ReceiptText },
  ];
  return (
    <div className="container-x py-8 sm:py-12">
      <header className="flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-14 shrink-0 place-items-center rounded-t-full rounded-b-2xl bg-brand-soft font-display text-2xl font-semibold text-brand">
          {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl font-semibold sm:text-4xl">{user.name || 'My account'}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="break-all">{user.email}</span>
            {user.isVerified ? <Badge tone="brand" icon={BadgeCheck}>Verified</Badge> : <Badge tone="accent" icon={MailWarning}>Not verified</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isStaff && <Button to="/admin" variant="quiet" size="sm" icon={LayoutDashboard}>Dashboard</Button>}
          <Button variant="quiet" size="sm" icon={LogOut} onClick={() => { logout(); navigate('/'); }}>Sign out</Button>
        </div>
      </header>

      <nav className="mt-8 flex gap-2 border-b border-line" aria-label="Account sections">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[15px] transition', isActive ? 'border-brand font-medium text-brand' : 'border-transparent text-muted hover:text-ink')}>
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-8"><Outlet /></div>
    </div>
  );
}
