import { useState } from 'react';
import { ArrowLeft, CircleAlert, KeyRound, Mail, MailCheck, Send } from 'lucide-react';
import FloatField from '@/components/ui/FloatField';
import Button from '@/components/ui/Button';
import { Alert, AuthCard } from '@/layouts/AuthLayout';
import { authApi } from '@/lib/api';
import { isEmail } from '@/lib/helpers';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!isEmail(email)) { setFieldError('Enter the email you registered with'); return; }
    setFieldError('');
    setLoading(true);
    try { await authApi.forgot(email.trim()); setSent(true); }
    catch (err) { setServerError(err.message === 'User not found' ? 'We couldn’t find an account with that email.' : err.message); }
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle="We’ve sent you a reset link." icon={MailCheck}>
        <Alert tone="success" icon={MailCheck}>If <b>{email}</b> matches an account, a password reset link is on its way. The link expires soon, so use it right away.</Alert>
        <Button to="/login" variant="outline" size="lg" full icon={ArrowLeft} className="mt-6">Back to sign in</Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your email and we’ll send you a link to choose a new one." icon={KeyRound}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <FloatField icon={Mail} label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldError} />
        {serverError && <Alert icon={CircleAlert}>{serverError}</Alert>}
        <Button type="submit" variant="outline" size="lg" full icon={Send} iconPosition="right" loading={loading}>Send reset link</Button>
        <Button to="/login" variant="ghost" full icon={ArrowLeft}>Back to sign in</Button>
      </form>
    </AuthCard>
  );
}
