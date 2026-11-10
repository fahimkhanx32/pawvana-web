import { Link } from 'react-router-dom';
import { Package, ReceiptText, TriangleAlert, Users, Wallet } from 'lucide-react';
import { Badge, Skeleton } from '@/components/ui/Bits';
import SmartImage from '@/components/ui/SmartImage';
import { PageHeader } from '@/layouts/AdminLayout';
import { useAdminData } from './useAdminData';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';
import { BRAND } from '@/config/brand';
import { fmtDate, mainImage, money, stockState } from '@/lib/helpers';
import { orderStatus } from '@/pages/account/Orders';

function Stat({ icon: Icon, label, value, note, loading }) {
  return (
    <div className="panel p-5">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon size={20} /></span>
      <p className="mt-4 text-sm text-muted">{label}</p>
      {loading ? <Skeleton className="mt-1 h-9 w-24" /> : <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>}
      {note && !loading && <p className="mt-1 text-sm text-muted">{note}</p>}
    </div>
  );
}

export default function Overview() {
  const { isAdmin, user } = useAuth();
  const { all, loading: catLoading } = useCatalog();
  const { users, orders, loading } = useAdminData({ withOrders: isAdmin });

  const active = all.filter((p) => p.status === 'active').length;
  const out = all.filter((p) => Number(p.stock) <= 0);
  const low = all.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= BRAND.lowStockAt);
  const attention = [...out, ...low].slice(0, 6);
  const byCat = Object.entries(all.reduce((a, p) => ({ ...a, [p.category]: (a[p.category] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = byCat[0]?.[1] || 1;
  const valid = (orders || []).filter((o) => o.status !== 'reject');

  return (
    <>
      <PageHeader title={`Hello, ${(user.name || 'there').split(' ')[0]}`} text="Here’s how the shop is doing." />

      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Package} label="Products" value={all.length} note={`${active} live in the store`} loading={catLoading} />
        <Stat icon={TriangleAlert} label="Needs restocking" value={out.length + low.length} note={`${out.length} sold out · ${low.length} running low`} loading={catLoading} />
        {isAdmin && <Stat icon={Users} label="Customers" value={(users || []).filter((u) => u.role === 'user').length} note={`${(users || []).length} accounts in total`} loading={loading} />}
        {isAdmin && <Stat icon={Wallet} label="Order value" value={money(valid.reduce((s, o) => s + o.totalPrice, 0))} note={`${(orders || []).length} orders · ${(orders || []).filter((o) => o.status === 'pending').length} pending`} loading={loading} />}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Needs attention</h2><Link to="/admin/products" className="text-sm font-medium text-brand">Manage stock</Link></div>
          {attention.length === 0 ? <p className="py-6 text-center text-muted">Everything is well stocked.</p> : (
            <ul className="divide-y divide-line">
              {attention.map((p) => {
                const s = stockState(p.stock);
                return (
                  <li key={p._id} className="flex items-center gap-3 py-3">
                    <SmartImage src={mainImage(p)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{p.title}</span><span className="block truncate text-sm text-muted">{p.category}</span></span>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Products by category</h2>
          {byCat.length === 0 ? <p className="py-6 text-center text-muted">No products yet.</p> : (
            <ul className="space-y-4">
              {byCat.map(([name, n]) => (
                <li key={name}>
                  <div className="mb-1.5 flex justify-between text-[15px]"><span className="truncate">{name}</span><span className="tabular-nums text-muted">{n}</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface2"><div className="h-full rounded-full bg-brand" style={{ width: `${(n / maxCat) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isAdmin && (
          <section className="panel p-5 sm:p-6 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Recent orders</h2><Link to="/admin/orders" className="text-sm font-medium text-brand">All orders</Link></div>
            {loading ? <Skeleton className="h-32" /> : (orders || []).length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted"><ReceiptText size={28} /><p className="mt-2">No orders yet.</p></div>
            ) : (
              <ul className="divide-y divide-line">
                {orders.slice(0, 5).map((o) => {
                  const s = orderStatus[o.status] || orderStatus.pending;
                  return (
                    <li key={o._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                      <span className="min-w-0 flex-1"><span className="block truncate font-medium">{o.customer?.name || o.customer?.email}</span><span className="block text-sm text-muted">#{o.tranid} · {fmtDate(o.createdAt)}</span></span>
                      <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
                      <span className="w-24 text-right font-medium tabular-nums">{money(o.totalPrice)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
