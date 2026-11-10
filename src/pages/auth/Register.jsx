import { useState } from 'react';
import { CircleAlert, KeyRound, LogIn, Mail, MailCheck, Phone, ShieldCheck, User, UserPlus } from 'lucide-react';
import FloatField from '@/components/ui/FloatField';
import Button from '@/components/ui/Button';
import { Alert, AuthCard, OrDivider } from '@/layouts/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { isEmail, isPhone } from '@/lib/helpers';

export default function Register() {
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const n = {};
    if (f.name.trim().length < 2) n.name = 'Enter your full name';
    if (!isEmail(f.email)) n.email = 'Enter a valid email address';
    if (f.phone && !isPhone(f.phone)) n.phone = 'Enter a valid phone number';
    if (f.password.length < 8) n.password = 'Use at least 8 characters';
    if (f.confirmPassword !== f.password) n.confirmPassword = 'Passwords don’t match';
    setErrors(n);
    setServerError('');
    if (Object.keys(n).length) return;

    setLoading(true);
    try {
      const res = await register(f);
      setDone(res.message || 'Registration successful. Check your email to verify your account.');
    } catch (err) {
      setServerError(err.message === 'User exist' ? 'An account with this email already exists. Try signing in instead.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Check your inbox" subtitle="One more step to activate your account." icon={MailCheck}>
        <Alert tone="success" icon={MailCheck}>{done}</Alert>
        <p className="mt-4 text-[15px] text-muted">We sent a verification link to <b className="text-ink">{f.email}</b>. You can sign in right away — verifying keeps your account secure.</p>
        <Button to="/login" variant="outline" size="lg" full icon={LogIn} iconPosition="right" className="mt-6">Continue to sign in</Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Join to save your cart, track orders and checkout faster." icon={UserPlus}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <FloatField icon={User} label="Full name" name="name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
        <FloatField icon={Mail} label="Email address" type="email" name="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
        <FloatField icon={Phone} label="Phone number (optional)" type="tel" name="phone" autoComplete="tel" inputProps={{ inputMode: 'tel' }} value={f.phone} onChange={set('phone')} error={errors.phone} />
        <FloatField icon={KeyRound} label="Password" type="password" name="password" autoComplete="new-password" placeholder="At least 8 characters" value={f.password} onChange={set('password')} error={errors.password} />
        <FloatField icon={ShieldCheck} label="Confirm password" type="password" name="confirmPassword" autoComplete="new-password" value={f.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />

        {serverError && <Alert icon={CircleAlert}>{serverError}</Alert>}
        <Button type="submit" variant="outline" size="lg" full icon={UserPlus} iconPosition="right" loading={loading}>Sign up</Button>
      </form>

      <OrDivider>Already have an account?</OrDivider>
      <Button to="/login" variant="quiet" full icon={LogIn} iconPosition="right">Sign in</Button>
    </AuthCard>
  );
}
