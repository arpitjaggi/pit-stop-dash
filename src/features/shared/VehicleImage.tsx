import { useState } from 'react';
import { useSignedUrl } from '@/data/hooks';
import type { Vehicle } from '@/data/types';
import { mutedPaint } from '@/lib/colour';
import { isLightColour } from '@/lib/image';
import { cx } from '@/ui/atoms';

type Variant = 'bay' | 'hero' | 'thumb';

/**
 * The vehicle as an object: the owner's photograph, shown large. With no photo it falls back to a
 * flat field of the vehicle's paint colour with the model set big on it: honest, never a silhouette.
 */
export function VehicleImage({ vehicle, variant, className, eager }: { vehicle: Vehicle; variant: Variant; className?: string; eager?: boolean }) {
  const path = variant === 'thumb' ? vehicle.photo_thumb_path ?? vehicle.photo_path : vehicle.photo_path;
  const url = useSignedUrl('photos', path);
  const [loaded, setLoaded] = useState(false);
  const paint = vehicle.colour_hex ? mutedPaint(vehicle.colour_hex) : null;
  const light = paint ? isLightColour(paint) : true;
  const style = paint ? ({ '--paint': paint } as React.CSSProperties) : undefined;

  return (
    <div className={cx('vimg', `vimg--${variant}`, !path && variant !== 'thumb' && 'vimg--band', paint && 'vimg--paint', paint && (light ? 'vimg--light' : 'vimg--dark'), className)} style={style}>
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
        <span className="vimg__mono fig" aria-hidden="true">
          {vehicle.model.slice(0, 2).toUpperCase()}
        </span>
      ) : variant === 'hero' ? null : (
        <span className="vimg__name" aria-hidden="true">
          <span className="vimg__model">{vehicle.model}</span>
        </span>
      )}
    </div>
  );
}
