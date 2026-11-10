import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircleAlert, KeyRound, LockKeyhole, Save } from 'lucide-react';
import FloatField from '@/components/ui/FloatField';
import Button from '@/components/ui/Button';
import { Alert, AuthCard } from '@/layouts/AuthLayout';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/lib/api';

// Route: /resetpassword/:token  (this exact path is what the backend's email links to)
export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = {};
    if (password.length < 8) n.password = 'Use at least 8 characters';
    if (confirm !== password) n.confirm = 'Passwords don’t match';
    setErrors(n);
    setServerError('');
    if (Object.keys(n).length) return;
    setLoading(true);
    try {
      await authApi.reset(token, password, confirm);
      toast.success('Password updated. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(err.message === 'Unauthorized' ? 'This reset link is invalid or has expired. Request a new one.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle="Make it at least 8 characters." icon={LockKeyhole}>
      <form onSubmit={submit} noValidate className="space-y-5">
        <FloatField icon={KeyRound} label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <FloatField icon={LockKeyhole} label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        {serverError && <Alert icon={CircleAlert}>{serverError}</Alert>}
        <Button type="submit" variant="outline" size="lg" full icon={Save} iconPosition="right" loading={loading}>Update password</Button>
      </form>
    </AuthCard>
  );
}
