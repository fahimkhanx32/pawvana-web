import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, CircleAlert, LoaderCircle, LogIn, MailCheck, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import { AuthCard } from '@/layouts/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';

// Route: /verifyemail/:token  (this exact path is what the backend's email links to)
export default function VerifyEmail() {
  const { token } = useParams();
  const { isAuthed, refresh } = useAuth();
  const [state, setState] = useState('loading'); // loading | ok | already | error
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const res = await authApi.verify(token);
        if (/already/i.test(res.message || '')) setState('already');
        else setState('ok');
        if (isAuthed) refresh();
      } catch (e) {
        setMessage(e.message === 'Unauthorized' ? 'This verification link is invalid or has expired.' : e.message);
        setState('error');
      }
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = {
    loading: { title: 'Verifying your email…', sub: 'This only takes a moment.', icon: MailCheck },
    ok: { title: 'Email verified', sub: 'Your account is all set.', icon: BadgeCheck },
    already: { title: 'Already verified', sub: 'Nothing more to do — you’re good to go.', icon: BadgeCheck },
    error: { title: 'Couldn’t verify', sub: message, icon: CircleAlert },
  }[state];

  return (
    <AuthCard title={view.title} subtitle={view.sub} icon={view.icon}>
      {state === 'loading' ? (
        <div className="flex justify-center py-6 text-brand"><LoaderCircle size={36} className="animate-spin" aria-label="Loading" /></div>
      ) : (
        <div className="grid gap-3">
          {state === 'error' ? (
            <Button to="/login" variant="outline" size="lg" full icon={LogIn} iconPosition="right">Go to sign in</Button>
          ) : (
            <Button to="/" variant="outline" size="lg" full icon={Store} iconPosition="right">Start shopping</Button>
          )}
        </div>
      )}
    </AuthCard>
  );
}
