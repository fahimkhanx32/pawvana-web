import { PawPrint, Store } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="arch grid h-32 w-28 place-items-center bg-brand-soft text-brand"><PawPrint size={44} strokeWidth={1.3} /></span>
      <h1 className="mt-6 font-display text-5xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-sm text-muted">The page you’re looking for has wandered off. Let’s get you back to the shop.</p>
      <Button to="/" size="lg" icon={Store} className="mt-8">Back to home</Button>
    </div>
  );
}
