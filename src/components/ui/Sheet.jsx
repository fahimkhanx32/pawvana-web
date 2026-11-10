import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { cx } from '@/lib/helpers';

const layout = {
  right: { wrap: 'justify-end', panel: 'ml-auto h-full w-full animate-slideIn sm:rounded-l-4xl' },
  left: { wrap: 'justify-start', panel: 'mr-auto h-full w-[88%] max-w-sm animate-slideInL rounded-r-4xl' },
  bottom: { wrap: 'items-end', panel: 'w-full max-h-[90dvh] animate-sheetUp rounded-t-4xl' },
  modal: { wrap: 'items-end justify-center md:items-center', panel: 'w-full max-h-[92dvh] animate-sheetUp rounded-t-4xl md:max-w-lg md:animate-pop md:rounded-4xl' },
};

/**
 * One overlay primitive for drawers, bottom sheets and dialogs.
 * side: 'right' | 'left' | 'bottom' | 'modal'.  Phones get bottom sheets, desktops get centred dialogs.
 */
export default function Sheet({ open, onClose, side = 'right', title, subtitle, icon: Icon, children, footer, width = 'sm:max-w-xl', className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    if (ref.current && !ref.current.contains(document.activeElement)) ref.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const l = layout[side];

  return createPortal(
    <div className={cx('fixed inset-0 z-[90] flex', l.wrap)}>
      <div className="absolute inset-0 animate-fade bg-[rgb(var(--ink)/.45)] backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx('relative flex flex-col border border-line bg-surface text-ink shadow-lift outline-none', l.panel, side === 'right' && width, className)}
      >
        {(title || Icon) && (
          <header className="flex items-center gap-3 border-b border-line px-5 py-4">
            {Icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon size={20} /></span>}
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-semibold">{title}</h2>
              {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
            </div>
            <IconButton icon={X} label="Close" onClick={onClose} size={40} />
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <footer className="safe-b border-t border-line bg-surface px-5 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
