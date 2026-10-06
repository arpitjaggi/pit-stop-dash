import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { isTwoWheeler, type Vehicle } from '@/data/types';
import { formatRegistration, plateTone, splitRegistration, type PlateTone } from '@/lib/plate';
import type { Severity } from '@/lib/status';
import { CheckCircle, Clock, WarningOctagon } from '@/ui/icons';

/** Turns database errors into something a person can act on. */
export function friendlyError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/vehicles_user_registration_key|already in your garage/i.test(m)) return 'A vehicle with this registration number is already in your garage.';
  if (/Failed to fetch|NetworkError|network/i.test(m)) return 'We could not reach the server. Check your connection and try again.';
  return m;
}

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

// ---------------------------------------------------------------- buttons

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  busy?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', block, busy, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cx('btn', `btn--${variant}`, block && 'btn--block', busy && 'is-busy', className)} disabled={disabled || busy} aria-busy={busy || undefined} {...rest}>
      {children}
    </button>
  );
});

export function LinkButton({ variant = 'secondary', block, className, ...rest }: LinkProps & { variant?: Variant; block?: boolean }) {
  return <Link className={cx('btn', `btn--${variant}`, block && 'btn--block', className)} {...rest} />;
}

// ---------------------------------------------------------------- form fields

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: (a: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  const describedBy = error || hint ? msgId : undefined;
  return (
    <div className={cx('field', className)}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {(error || hint) && (
        <p id={msgId} className={cx('field__msg', error && 'field__msg--error')} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cx('input', className)} {...rest} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ className, rows = 3, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={cx('input input--area', className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cx('input input--select', className)} {...rest}>
      {children}
    </select>
  );
});

/** A set of mutually exclusive choices as large, readable rows or compact chips. */
export function Choice<T extends string>({
  legend,
  value,
  onChange,
  options,
  layout = 'chips',
  hideLegend,
}: {
  legend: string;
  hideLegend?: boolean;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  layout?: 'chips' | 'rows' | 'grid';
}) {
  const name = useId();
  return (
    <fieldset className={cx('choice', `choice--${layout}`)}>
      <legend className={cx('field__label', hideLegend && 'sr-only')}>{legend}</legend>
      <div className="choice__set">
        {options.map((o) => (
          <label key={o.value} className="choice__opt">
            <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
            <span className="choice__face">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------- identity and status

/** The registration number as an HSRP plate: blue IND strip, colours by use, two lines on a two-wheeler. */
export function Plate({ value, size = 'md', tone = 'private', stacked = false }: { value: string; size?: 'sm' | 'md' | 'lg'; tone?: PlateTone; stacked?: boolean }) {
  const text = formatRegistration(value);
  const two = stacked && size !== 'sm';
  const [top, bottom] = splitRegistration(value);
  return (
    <span className={cx('plate', `plate--${size}`, `plate--${tone}`, two && 'plate--stacked')} role="img" aria-label={`Registration number ${text}`}>
      <span className="plate__ind" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="plate__chakra" fill="none" stroke="currentColor" strokeWidth="1.1">
          <circle cx="8" cy="8" r="5.6" />
          <path d="M8 2.4v11.2M2.4 8h11.2M4 4l8 8M12 4l-8 8" strokeWidth="0.8" />
        </svg>
        <span className="plate__ind-text">IND</span>
      </span>
      <span className="plate__num" aria-hidden="true">
        {two && bottom ? (
          <>
            <span>{top}</span>
            <span>{bottom}</span>
          </>
        ) : (
          text
        )}
      </span>
    </span>
  );
}

/** A vehicle's plate in its true colours. */
export function VehiclePlate({ vehicle, size = 'md' }: { vehicle: Pick<Vehicle, 'registration_number' | 'plate_use' | 'fuel_type' | 'vehicle_type'>; size?: 'sm' | 'md' | 'lg' }) {
  if (!vehicle.registration_number) return null;
  return <Plate value={vehicle.registration_number} size={size} tone={plateTone(vehicle.plate_use, vehicle.fuel_type)} stacked={isTwoWheeler(vehicle.vehicle_type)} />;
}

const SR: Record<Severity, string> = { overdue: 'Needs attention: ', soon: 'Coming up: ', info: 'To do: ', clear: '', neutral: '' };

/** The mark for a status. Overdue and soon are both yellow, so they differ by shape: a warning octagon on a yellow tile, or a plain clock. */
export function StatusMark({ severity, className }: { severity: Severity; className?: string }) {
  if (severity === 'overdue') {
    return <span className={cx('status__mark', 'status__mark--overdue', className)} aria-hidden="true"><WarningOctagon size="100%" weight="bold" /></span>;
  }
  if (severity === 'soon') {
    return <span className={cx('status__mark', 'status__mark--soon', className)} aria-hidden="true"><Clock size="100%" weight="bold" /></span>;
  }
  if (severity === 'clear') {
    return <span className={cx('status__mark', 'status__mark--clear', className)} aria-hidden="true"><CheckCircle size="100%" weight="fill" /></span>;
  }
  return <span className={cx('status__mark', className)} aria-hidden="true" />;
}

/** A status as a plain sentence led by a small mark. Never colour alone: the words carry it. */
export function StatusLine({ severity, children, className, as: Tag = 'span' }: { severity: Severity; children: ReactNode; className?: string; as?: 'span' | 'p' | 'div' }) {
  return (
    <Tag className={cx('status', `status--${severity}`, className)}>
      <StatusMark severity={severity} />
      <span className="status__text">
        {SR[severity] && <span className="sr-only">{SR[severity]}</span>}
        {children}
      </span>
    </Tag>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="spinner" role="status" aria-label={label}>
      <span />
    </span>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error'; children: ReactNode }) {
  return (
    <p className={cx('notice', `notice--${tone}`)} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <h2 className="t-section">{title}</h2>
      {body && <p className="t-body t-ink-2">{body}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
