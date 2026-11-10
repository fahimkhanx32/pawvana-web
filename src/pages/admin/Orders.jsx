import { useMemo, useState } from 'react';
import { Eye, ReceiptText, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import Sheet from '@/components/ui/Sheet';
import { Badge, EmptyState, Skeleton } from '@/components/ui/Bits';
import { PageHeader } from '@/layouts/AdminLayout';
import { useAdminData } from './useAdminData';
import { orderStatus } from '@/pages/account/Orders';
import { fmtDate, money } from '@/lib/helpers';

export default function AdminOrders() {
  const { orders, loading, error } = useAdminData({ withOrders: true });
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (orders || []).filter((o) => !t || [o.tranid, o.customer?.name, o.customer?.email].filter(Boolean).join(' ').toLowerCase().includes(t));
  }, [orders, q]);

  return (
    <>
      <PageHeader title="Orders" text="Status is read-only: the backend doesn’t yet update an order after payment." />
      <div className="mb-6 max-w-xl"><FloatField icon={Search} label="Search orders" placeholder="Order number, name or email" value={q} onChange={(e) => setQ(e.target.value)} /></div>

      {error ? <EmptyState icon={ReceiptText} title="Couldn’t load orders" text={error} />
        : loading ? <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 !rounded-3xl" />)}</div>
        : list.length === 0 ? <EmptyState icon={ReceiptText} title="No orders found" text="Orders appear here once customers check out." />
        : (
          <ul className="space-y-3">
            {list.map((o) => {
              const s = orderStatus[o.status] || orderStatus.pending;
              return (
                <li key={o._id} className="panel flex flex-wrap items-center gap-x-5 gap-y-3 p-4 sm:px-6">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium">{o.customer?.name || o.customer?.email}</p>
                    <p className="truncate text-sm text-muted">#{o.tranid} · {fmtDate(o.createdAt)}</p>
                  </div>
                  <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
                  <span className="w-24 text-right font-display text-lg font-semibold tabular-nums">{money(o.totalPrice)}</span>
                  <Button variant="quiet" size="sm" icon={Eye} onClick={() => setOpen(o)}>Details</Button>
                </li>
              );
            })}
          </ul>
        )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Order #${open.tranid}` : ''} subtitle={open ? fmtDate(open.createdAt) : ''} icon={ReceiptText}>
        {open && (
          <div className="space-y-5 p-5">
            <div className="rounded-2xl bg-surface2 p-4 text-[15px]"><p className="font-medium">{open.customer?.name}</p><p className="break-all text-muted">{open.customer?.email}</p>{open.customer?.phone && <p className="text-muted">{open.customer.phone}</p>}</div>
            <ul className="divide-y divide-line border-y border-line">
              {open.products.map((p, i) => (
                <li key={i} className="flex justify-between gap-4 py-3 text-[15px]"><span className="min-w-0">{p.title} <span className="text-muted">× {p.quantity}</span><span className="block break-all text-xs text-muted">{p.sku}</span></span><span className="tabular-nums">{money(p.price * p.quantity)}</span></li>
              ))}
            </ul>
            <div className="flex justify-between text-lg font-semibold"><span>Total incl. delivery</span><span className="font-display tabular-nums">{money(open.totalPrice)}</span></div>
          </div>
        )}
      </Sheet>
    </>
  );
}
