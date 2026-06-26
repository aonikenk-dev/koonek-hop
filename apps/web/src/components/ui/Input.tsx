import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, invalid, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;
  const hasError = invalid || Boolean(error);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-2xs font-mono text-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'w-full px-3 py-2.5 rounded border bg-surface font-mono text-sm text-text',
          'placeholder:text-muted outline-none transition-colors',
          'focus:border-moss focus:ring-1 focus:ring-moss/20',
          hasError ? 'border-sienna/60' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-sienna font-mono">{error}</p>}
    </div>
  );
});

export default Input;
