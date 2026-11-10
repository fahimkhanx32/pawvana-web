import { useEffect, useState } from 'react';
import { BadgeCheck, Ban, Hourglass, PackageSearch, ReceiptText, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge, EmptyState, Skeleton } from '@/components/ui/Bits';
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/lib/api';
import { fmtDate, money } from '@/lib/helpers';

export const orderStatus = {
  pending: { tone: 'accent', icon: Hourglass, label: 'Pending' },
  approved: { tone: 'brand', icon: BadgeCheck, label: 'Approved' },
  reject: { tone: 'danger', icon: Ban, label: 'Rejected' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    orderApi.forUser(user._id)
      .then((d) => live && setOrders([...(d.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [user._id]);

  if (error) return <EmptyState icon={PackageSearch} title="Couldn’t load your orders" text={error} />;
  if (!orders) return <div className="space-y-4">{[0, 1].map((i) => <Skeleton key={i} className="h-40 !rounded-3xl" />)}</div>;
  if (!orders.length) {
    return <EmptyState icon={ReceiptText} title="No orders yet" text="When you place an order it will show up here." action={<Button to="/shop" icon={Store}>Start shopping</Button>} />;
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => {
        const s = orderStatus[o.status] || orderStatus.pending;
        return (
          <li key={o._id} className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted">Order</p>
                <p className="break-all font-medium">#{o.tranid}</p>
                <p className="mt-0.5 text-sm text-muted">{fmtDate(o.createdAt)}</p>
              </div>
              <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
            </div>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {(o.products || []).map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                  <span className="min-w-0 truncate">{p.title} <span className="text-muted">× {p.quantity}</span></span>
                  <span className="shrink-0 tabular-nums">{money(p.price * p.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-muted">Total incl. delivery</span>
              <span className="font-display text-xl font-semibold tabular-nums">{money(o.totalPrice)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
