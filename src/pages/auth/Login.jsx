import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleAlert, CircleCheck, CircleUser, KeyRound, LogIn, Mail, NotebookPen, PawPrint } from 'lucide-react';
import FloatField from '@/components/ui/FloatField';
import Button from '@/components/ui/Button';
import { Alert, AuthCard, OrDivider } from '@/layouts/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isEmail, store } from '@/lib/helpers';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const saved = store.get('rememberedEmail', '');
  const [email, setEmail] = useState(saved);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(!!saved);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = 'Enter the email you registered with';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const u = await login(email, password);
      if (remember) store.set('rememberedEmail', email.trim()); else store.del('rememberedEmail');
      toast.success(`Welcome back${u.name ? `, ${u.name.split(' ')[0]}` : ''}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue to your cart and orders." icon={PawPrint}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <FloatField icon={Mail} label="Email address" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <FloatField icon={KeyRound} label="Password" type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />

        <div className="flex flex-wrap gap-2.5">
          <Button
            variant={remember ? 'soft' : 'outline'}
            size="sm"
            icon={remember ? CircleCheck : CircleUser}
            aria-pressed={remember}
            onClick={() => setRemember((r) => !r)}
            className="min-w-[9.5rem] flex-1 !rounded-full"
          >
            Remember my ID
          </Button>
          <Button to="/forgot-password" variant="outline" size="sm" icon={KeyRound} iconPosition="right" className="min-w-[9.5rem] flex-1 !rounded-full">
            Forgot password?
          </Button>
        </div>

        {serverError && <Alert icon={CircleAlert}>{serverError}</Alert>}

        <Button type="submit" variant="outline" size="lg" full icon={LogIn} iconPosition="right" loading={loading}>Sign in</Button>
      </form>

      <OrDivider>Don’t have an account? Create one</OrDivider>
      <Button to="/register" variant="quiet" full icon={NotebookPen} iconPosition="right">Register</Button>
    </AuthCard>
  );
}
