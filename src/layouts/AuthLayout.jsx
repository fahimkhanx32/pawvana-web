import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, Bird, Cat, Dog } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { BRAND } from '@/config/brand';

function Arches() {
  const base = 'arch grid place-items-end justify-items-center pb-6 animate-rise';
  return (
    <div className="flex items-end justify-center gap-4" aria-hidden>
      <div className={`${base} h-56 w-36 bg-brand-soft text-brand`} style={{ animationDelay: '.1s' }}><Dog size={56} strokeWidth={1.2} /></div>
      <div className={`${base} h-80 w-40 bg-brand text-brand-ink`} style={{ animationDelay: '.25s' }}><Cat size={64} strokeWidth={1.2} /></div>
      <div className={`${base} h-44 w-32 bg-accent text-[#2b1a04]`} style={{ animationDelay: '.4s' }}><Bird size={52} strokeWidth={1.2} /></div>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface2 p-12 lg:flex">
        <Logo />
        <Arches />
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-[1.1]">Care that feels as good as it looks.</h2>
          <p className="mt-3 text-muted">One account for your cart, your orders and everything your pets love. {BRAND.name} delivers across Bangladesh.</p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="lg:invisible"><Logo /></div>
          <div className="flex items-center gap-1">
            <Link to="/" aria-label="Back to store" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted transition hover:bg-surface2 hover:text-ink">
              <ArrowLeft size={16} /><span className="hidden xs:inline">Back to store</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <main className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8">
          <div className="w-full max-w-[460px]"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

/** The glass panel from the reference design. */
export function AuthCard({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="animate-pop rounded-[28px] border border-ink/80 bg-surface/70 p-5 shadow-lift backdrop-blur-xl xs:p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        {Icon && <span className="grid h-14 w-12 shrink-0 place-items-center rounded-t-full rounded-b-2xl bg-brand-soft text-brand"><Icon size={24} /></span>}
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-semibold leading-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Alert({ tone = 'danger', icon: Icon, children }) {
  const cls = tone === 'danger' ? 'border-danger/30 bg-danger/10 text-danger' : 'border-brand/30 bg-brand-soft text-brand';
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-sm ${cls}`}>
      {Icon && <Icon size={18} className="mt-0.5 shrink-0" />}
      <p className="min-w-0 break-words">{children}</p>
    </div>
  );
}

export function OrDivider({ children }) {
  return (
    <div className="my-6 flex items-center gap-3 text-sm xs:text-[15px]">
      <span className="h-px min-w-3 flex-1 bg-ink/25" />
      <span className="max-w-[80%] text-center">{children}</span>
      <span className="h-px min-w-3 flex-1 bg-ink/25" />
    </div>
  );
}
