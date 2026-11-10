import { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';
import { cx } from '@/lib/helpers';

/** Image with a graceful paw placeholder when the file is missing or fails to load. */
export default function SmartImage({ src, alt = '', className, icon: Icon = PawPrint, ...rest }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (!src || bad) {
    return (
      <div role="img" aria-label={alt} className={cx('grid place-items-center bg-surface2 text-muted/50', className)}>
        <Icon className="h-1/3 w-1/3" strokeWidth={1.2} aria-hidden />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={className} {...rest} />;
}
