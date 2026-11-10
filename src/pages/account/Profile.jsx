import { useState } from 'react';
import { Building2, Hash, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatField from '@/components/ui/FloatField';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isPhone } from '@/lib/helpers';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const b = user.billingAddress || {};
  const [f, setF] = useState({
    name: user.name || '', phone: user.phone || '', address: user.address || '', city: user.city || '', postalCode: user.postalCode || '',
    bName: b.fullName || '', bEmail: b.email || '', bPhone: b.phoneNumber || '', bStreet: b.street || '', bZip: b.zipCode || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const n = {};
    if (f.name.trim().length < 2) n.name = 'Enter your full name';
    if (f.phone && !isPhone(f.phone)) n.phone = 'Enter a valid phone number';
    if (f.bPhone && !isPhone(f.bPhone)) n.bPhone = 'Enter a valid phone number';
    setErrors(n);
    if (Object.keys(n).length) return;
    setSaving(true);
    try {
      await updateProfile({
        name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), city: f.city.trim(), postalCode: f.postalCode.trim(),
        billingAddress: { fullName: f.bName.trim(), email: f.bEmail.trim(), phoneNumber: f.bPhone.trim(), street: f.bStreet.trim(), zipCode: f.bZip.trim() },
      });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="grid gap-6 lg:grid-cols-2">
      <section className="panel space-y-5 p-5 sm:p-7">
        <h2 className="font-display text-2xl font-semibold">Personal details</h2>
        <FloatField icon={User} label="Full name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
        <FloatField icon={Mail} label="Email address" value={user.email || ''} readOnly disabled helperText="Your email is your sign-in ID and can’t be changed here." />
        <FloatField icon={Phone} label="Phone number" type="tel" autoComplete="tel" inputProps={{ inputMode: 'tel' }} value={f.phone} onChange={set('phone')} error={errors.phone} />
        <FloatField icon={MapPin} label="Address" autoComplete="street-address" value={f.address} onChange={set('address')} />
        <div className="grid gap-5 xs:grid-cols-2">
          <FloatField icon={Building2} label="City" autoComplete="address-level2" value={f.city} onChange={set('city')} />
          <FloatField icon={Hash} label="Postal code" autoComplete="postal-code" value={f.postalCode} onChange={set('postalCode')} />
        </div>
      </section>

      <section className="panel space-y-5 p-5 sm:p-7">
        <div>
          <h2 className="font-display text-2xl font-semibold">Billing details</h2>
          <p className="mt-1 text-sm text-muted">Used to pre-fill checkout. Optional.</p>
        </div>
        <FloatField icon={User} label="Billing name" value={f.bName} onChange={set('bName')} />
        <FloatField icon={Mail} label="Billing email" type="email" value={f.bEmail} onChange={set('bEmail')} />
        <FloatField icon={Phone} label="Billing phone" type="tel" inputProps={{ inputMode: 'tel' }} value={f.bPhone} onChange={set('bPhone')} error={errors.bPhone} />
        <FloatField icon={MapPin} label="Billing street" value={f.bStreet} onChange={set('bStreet')} />
        <FloatField icon={Hash} label="Billing postal code" value={f.bZip} onChange={set('bZip')} />
      </section>

      <div className="lg:col-span-2">
        <Button type="submit" size="lg" icon={Save} loading={saving} className="w-full sm:w-auto sm:min-w-[14rem]">Save changes</Button>
      </div>
    </form>
  );
}
