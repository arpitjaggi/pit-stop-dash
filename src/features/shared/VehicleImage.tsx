import { useState } from 'react';
import { useSignedUrl } from '@/data/hooks';
import type { Vehicle } from '@/data/types';
import { isLightColour } from '@/lib/image';
import { cx } from '@/ui/atoms';

type Variant = 'bay' | 'hero' | 'thumb';

/**
 * The vehicle as an object: the owner's photograph, shown large. With no photo it becomes a paint
 * stage: a pale tint of the vehicle's own paint colour with a big flat disc of the paint itself
 * (never a silhouette, never a render).
 */
export function VehicleImage({ vehicle, variant, className, eager }: { vehicle: Vehicle; variant: Variant; className?: string; eager?: boolean }) {
  const path = variant === 'thumb' ? vehicle.photo_thumb_path ?? vehicle.photo_path : vehicle.photo_path;
  const url = useSignedUrl('photos', path);
  const [loaded, setLoaded] = useState(false);
  const hex = vehicle.colour_hex;
  const on = hex && !isLightColour(hex) ? '#ffffff' : '#17140f';
  const style = { ...(hex ? { '--vc': hex } : {}), '--vc-on': on } as React.CSSProperties;

  return (
    <div className={cx('vimg', `vimg--${variant}`, !path && 'vimg--stage', className)} style={style}>
      {path ? (
        url && (
          <img
            src={url}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={cx('vimg__img', loaded && 'is-loaded')}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(false)}
          />
        )
      ) : variant === 'thumb' ? (
        <span className="vimg__mono" aria-hidden="true">
          {vehicle.model.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <>
          <span className="stage__disc" aria-hidden="true" />
          {variant === 'bay' && (
            <span className="stage__name" aria-hidden="true">
              <span className="stage__make">{vehicle.make}</span>
              <span className="stage__model">{vehicle.model}</span>
            </span>
          )}
        </>
      )}
    </div>
  );
}
