import { Heart, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Bits';
import { ProductGrid } from '@/components/shop/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Wishlist() {
  const { products } = useCatalog();
  const { ids } = useWishlist();
  const list = products.filter((p) => ids.includes(p._id));
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Saved for later</h1>
      <p className="mt-1.5 text-muted">Stored on this device.</p>
      <div className="mt-8">
        {list.length ? <ProductGrid products={list} /> : (
          <EmptyState icon={Heart} title="Nothing saved yet" text="Tap the heart on any product to keep it here." action={<Button to="/shop" icon={Store}>Browse the shop</Button>} />
        )}
      </div>
    </div>
  );
}
