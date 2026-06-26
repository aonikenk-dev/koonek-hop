import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  leftIcon?: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn bg-sienna text-white hover:bg-sienna-dim focus:ring-sienna/40',
};

export default function Button({ variant = 'primary', leftIcon, className, children, ...props }: ButtonProps) {
  return (
    <button className={clsx(VARIANT_CLASS[variant], className)} {...props}>
      {leftIcon}
      {children}
    </button>
  );
}
