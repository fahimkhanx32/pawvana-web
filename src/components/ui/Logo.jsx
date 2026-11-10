import { Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { BRAND } from '@/config/brand';
import { cx } from '@/lib/helpers';

export default function Logo({ to = '/', className, hideName }) {
  return (
    <Link to={to} aria-label={`${BRAND.name} home`} className={cx('inline-flex items-center gap-2.5', className)}>
      <span className="grid h-10 w-9 place-items-center rounded-t-full rounded-b-xl bg-brand text-brand-ink shadow-soft">
        <PawPrint size={19} strokeWidth={2} />
      </span>
      {!hideName && <span className="font-display text-[22px] font-semibold tracking-tight">{BRAND.name}</span>}
    </Link>
  );
}
