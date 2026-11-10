import { TriangleAlert, X } from 'lucide-react';
import Sheet from './Sheet';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmIcon, loading, tone = 'danger' }) {
  return (
    <Sheet open={open} onClose={onClose} side="modal">
      <div className="p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger/10 text-danger"><TriangleAlert size={26} /></span>
        <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
        <p className="mx-auto mt-2 max-w-xs text-[15px] text-muted">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="quiet" icon={X} onClick={onClose}>Cancel</Button>
          <Button variant={tone} icon={confirmIcon || TriangleAlert} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Sheet>
  );
}
