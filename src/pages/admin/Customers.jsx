import { useMemo, useState } from 'react';
import { BadgeCheck, Ban, Mail, Phone, Save, Search, Settings2, Shield, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import Sheet from '@/components/ui/Sheet';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Badge, EmptyState, Skeleton } from '@/components/ui/Bits';
import { PageHeader } from '@/layouts/AdminLayout';
import { useAdminData } from './useAdminData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userApi } from '@/lib/api';
import { fmtDate } from '@/lib/helpers';

const roles = ['user', 'vendor', 'editor', 'admin'].map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }));

export default function Customers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const { users, loading, error, reload } = useAdminData();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (users || []).filter((u) => !t || [u.name, u.email, u.phone].filter(Boolean).join(' ').toLowerCase().includes(t));
  }, [users, q]);

  const run = async (key, fn, ok) => {
    setBusy(key);
    try { await fn(); toast.success(ok); await reload(); return true; }
    catch (e) { toast.error(e.message); return false; }
    finally { setBusy(''); }
  };
  const open = (u) => { setSel(u); setRole(u.role); };
  const self = sel?._id === me._id;

  return (
    <>
      <PageHeader title="Customers" text={`${(users || []).length} accounts`} />
      <div className="mb-6 max-w-xl"><FloatField icon={Search} label="Search customers" placeholder="Name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} /></div>

      {error ? <EmptyState icon={Users} title="Couldn’t load customers" text={error} />
        : loading ? <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 !rounded-3xl" />)}</div>
        : list.length === 0 ? <EmptyState icon={Users} title="No customers found" text="Try a different search." />
        : (
          <ul className="space-y-3">
            {list.map((u) => (
              <li key={u._id} className="panel flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-6">
                <span className="grid h-12 w-11 shrink-0 place-items-center rounded-t-full rounded-b-xl bg-brand-soft font-display text-lg font-semibold text-brand">{(u.name || u.email || '?').slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1 basis-44"><p className="truncate font-medium">{u.name || '—'}</p><p className="truncate text-sm text-muted">{u.email}</p></div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="muted" className="capitalize">{u.role}</Badge>
                  {u.isVerified ? <Badge tone="brand" icon={BadgeCheck}>Verified</Badge> : <Badge tone="accent">Unverified</Badge>}
                  {u.isHold && <Badge tone="danger" icon={Ban}>On hold</Badge>}
                </div>
                <Button variant="quiet" size="sm" icon={Settings2} onClick={() => open(u)}>Manage</Button>
              </li>
            ))}
          </ul>
        )}

      <Sheet open={!!sel} onClose={() => setSel(null)} side="modal" title={sel?.name || 'Customer'} subtitle={sel ? `Joined ${fmtDate(sel.createdAt)}` : ''} icon={Users}>
        {sel && (
          <div className="space-y-5 p-5">
            <div className="space-y-2 rounded-2xl bg-surface2 p-4 text-[15px]">
              <p className="flex items-center gap-2.5 break-all"><Mail size={16} className="shrink-0 text-muted" />{sel.email}</p>
              <p className="flex items-center gap-2.5"><Phone size={16} className="shrink-0 text-muted" />{sel.phone || 'No phone saved'}</p>
            </div>
            <FloatField icon={Shield} label="Role" select options={roles} value={role} onChange={(e) => setRole(e.target.value)} disabled={self} helperText={self ? 'You can’t change your own role.' : 'Admins manage everything; editors and vendors manage products.'} />
            <Button full icon={Save} disabled={self || role === sel.role} loading={busy === 'role'}
              onClick={async () => { if (await run('role', () => userApi.update(sel._id, { role }), 'Role updated')) setSel(null); }}>Save role</Button>
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-5">
              <Button variant="quiet" disabled={self} icon={sel.isHold ? UserCheck : UserX} loading={busy === 'hold'}
                onClick={async () => { if (await run('hold', () => userApi.update(sel._id, { isHold: !sel.isHold }), sel.isHold ? 'Account restored' : 'Account put on hold')) setSel(null); }}>
                {sel.isHold ? 'Lift hold' : 'Hold account'}
              </Button>
              <Button variant="danger" disabled={self} icon={Trash2} onClick={() => setConfirmDel(true)}>Delete</Button>
            </div>
          </div>
        )}
      </Sheet>
      <ConfirmDialog open={confirmDel} onClose={() => setConfirmDel(false)} loading={busy === 'del'} confirmLabel="Delete customer" confirmIcon={Trash2}
        title="Delete this customer?" message="They will no longer be able to sign in. Their past orders are kept."
        onConfirm={async () => { if (await run('del', () => userApi.remove(sel._id), 'Customer deleted')) { setConfirmDel(false); setSel(null); } }} />
    </>
  );
}
