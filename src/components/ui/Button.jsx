import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cx } from '@/lib/helpers';

const base =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50';
const variants = {
  primary: 'bg-brand text-brand-ink shadow-soft hover:brightness-110',
  outline: 'border border-ink/80 bg-surface/60 text-ink shadow-soft hover:bg-surface2',
  quiet: 'border border-line bg-surface text-ink hover:bg-surface2',
  soft: 'bg-brand-soft text-brand hover:brightness-95',
  ghost: 'text-ink hover:bg-surface2',
  danger: 'bg-danger text-white shadow-soft hover:brightness-110',
  accent: 'bg-accent text-[#2b1a04] shadow-soft hover:brightness-105',
};
const sizes = { sm: 'h-10 px-3.5 text-sm', md: 'h-12 px-5 text-[15px]', lg: 'h-14 px-6 text-base' };
const iconSize = { sm: 17, md: 19, lg: 21 };

/** Every Button takes an `icon` (a lucide component). iconPosition: 'left' | 'right'. */
const Button = forwardRef(function Button(
  { to, href, variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', loading, full, className, children, ...rest },
  ref,
) {
  const Comp = to ? Link : href ? 'a' : 'button';
  const props = { ref, ...rest };
  if (to) props.to = to;
  if (href) props.href = href;
  if (Comp === 'button') {
    props.type = rest.type || 'button';
    props.disabled = rest.disabled || loading;
  }
  const glyph = loading
    ? <LoaderCircle size={iconSize[size]} className="animate-spin" aria-hidden />
    : Icon ? <Icon size={iconSize[size]} strokeWidth={1.9} aria-hidden /> : null;
  return (
    <Comp {...props} className={cx(base, variants[variant], sizes[size], full && 'w-full', className)}>
      {iconPosition === 'left' && glyph}
      {children}
      {iconPosition === 'right' && glyph}
    </Comp>
  );
});
export default Button;

/** Icon-only round button. `label` is mandatory (screen readers). */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, badge, variant = 'ghost', size = 44, to, className, ...rest },
  ref,
) {
  const Comp = to ? Link : 'button';
  const v = { ghost: 'hover:bg-surface2', quiet: 'border border-line bg-surface hover:bg-surface2', solid: 'bg-brand text-brand-ink hover:brightness-110' }[variant];
  return (
    <Comp
      ref={ref}
      to={to}
      type={to ? undefined : 'button'}
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={cx('relative inline-grid shrink-0 place-items-center rounded-full text-ink transition active:scale-95 disabled:opacity-50', v, className)}
      {...rest}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.8} aria-hidden />
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-none text-[#2b1a04]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Comp>
  );
});
