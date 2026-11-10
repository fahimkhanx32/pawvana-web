import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { cx, money, priceOf } from '@/lib/helpers';

const tones = {
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent/20 text-[rgb(var(--ink))]',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-surface2 text-muted',
  ink: 'bg-ink text-bg',
};
export const Badge = ({ tone = 'muted', icon: Icon, children, className }) => (
  <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
    {Icon && <Icon size={12} aria-hidden />}
    {children}
  </span>
);

export const Skeleton = ({ className }) => <div className={cx('skeleton rounded-2xl', className)} aria-hidden />;

export function EmptyState({ icon: Icon, title, text, action, className }) {
  return (
    <div className={cx('mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center', className)}>
      <span className="arch grid h-24 w-20 place-items-center bg-brand-soft text-brand"><Icon size={32} strokeWidth={1.5} /></span>
      <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
      {text && <p className="mt-2 text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeading({ title, text, to, linkLabel = 'View all' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <h2 className="font-display text-[26px] font-semibold leading-tight sm:text-4xl">{title}</h2>
        {text && <p className="mt-1.5 max-w-xl text-muted">{text}</p>}
      </div>
      {to && (
        <Link to={to} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand">
          {linkLabel}
          <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Price({ product, size = 'md', className }) {
  const p = priceOf(product);
  const big = size === 'lg';
  return (
    <div className={cx('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cx('font-display font-semibold tabular-nums', big ? 'text-3xl sm:text-4xl' : 'text-[17px] sm:text-lg')}>{money(p.price)}</span>
      {p.hasDiscount && <span className={cx('text-muted line-through tabular-nums', big ? 'text-lg' : 'text-[13px]')}>{money(p.original)}</span>}
    </div>
  );
}

export function QtyStepper({ value, onChange, max, size = 'md', disabled }) {
  const h = size === 'sm' ? 'h-10' : 'h-12';
  const btn = 'grid aspect-square h-full place-items-center rounded-full text-ink transition hover:bg-surface2 active:scale-90 disabled:opacity-35 disabled:hover:bg-transparent';
  return (
    <div className={cx('inline-flex items-center rounded-full border border-line bg-surface p-1', h)} role="group" aria-label="Quantity">
      <button type="button" className={btn} onClick={() => onChange(-1)} disabled={disabled || value <= 1} aria-label="Decrease quantity"><Minus size={16} /></button>
      <output className="min-w-8 px-1 text-center text-[15px] font-medium tabular-nums" aria-live="polite">{value}</output>
      <button type="button" className={btn} onClick={() => onChange(1)} disabled={disabled || (max != null && value >= max)} aria-label="Increase quantity"><Plus size={16} /></button>
    </div>
  );
}
