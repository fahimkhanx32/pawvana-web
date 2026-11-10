import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, CircleX, Hourglass, ReceiptText, RotateCcw, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

// Route: /order-success  (aamarPay's success, fail and cancel URLs all point here)
export default function OrderSuccess() {
  const [sp] = useSearchParams();
  const { clear, refresh } = useCart();
  const raw = (sp.get('pay_status') || sp.get('status') || '').toLowerCase();
  const kind = /^(success|successful|paid|approved|completed)$/.test(raw) ? 'success' : /fail|cancel|reject|error/.test(raw) ? 'failed' : 'unknown';
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    // only empty the cart when the gateway tells us the payment went through
    if (kind === 'success') clear(); else refresh();
  }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = {
    success: { icon: BadgeCheck, tone: 'bg-brand-soft text-brand', title: 'Thank you — payment received', text: 'Your order is confirmed. We’ll start preparing it right away.' },
    failed: { icon: CircleX, tone: 'bg-danger/10 text-danger', title: 'Payment didn’t go through', text: 'You haven’t been charged. Your cart is safe — you can try again.' },
    unknown: { icon: Hourglass, tone: 'bg-accent/20 text-ink', title: 'We’re confirming your payment', text: 'This can take a moment. Check My orders for the latest status of your order.' },
  }[kind];
  const Icon = view.icon;

  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="panel max-w-lg animate-pop p-8 text-center sm:p-10">
        <span className={`arch mx-auto grid h-28 w-24 place-items-center ${view.tone}`}><Icon size={40} strokeWidth={1.5} /></span>
        <h1 className="mt-6 font-display text-3xl font-semibold">{view.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">{view.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {kind === 'failed' && <Button to="/checkout" icon={RotateCcw}>Try again</Button>}
          <Button to="/account/orders" variant={kind === 'failed' ? 'quiet' : 'primary'} icon={ReceiptText}>My orders</Button>
          <Button to="/shop" variant="quiet" icon={Store}>Keep shopping</Button>
        </div>
      </div>
    </div>
  );
}
