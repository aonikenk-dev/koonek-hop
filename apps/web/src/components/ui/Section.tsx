import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="kpi-card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <p className="eyebrow !mb-0">{title}</p>
        <ChevronDown size={14} className={clsx('text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-4 space-y-3">{children}</div>}
    </section>
  );
}
