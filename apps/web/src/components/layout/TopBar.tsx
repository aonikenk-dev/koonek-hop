import { Search, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp, type Language } from '@/contexts/AppContext';
import { organization } from '@/data/config/organization';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { t, language, setLanguage } = useApp();

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center px-5 gap-3 shrink-0">
      <div className="flex-1 min-w-0">
        {subtitle && <p className="eyebrow mb-0.5">{subtitle}</p>}
        <h1 className="font-display font-bold text-lg tracking-tight text-text leading-none truncate">{title}</h1>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-surface-2 border border-border rounded px-3 py-1.5 w-52">
        <Search size={13} className="text-muted shrink-0" />
        <input
          type="text"
          placeholder={t('topbar.searchPlaceholder')}
          className="bg-transparent text-sm font-mono text-text placeholder:text-muted outline-none flex-1 min-w-0"
        />
      </div>

      <div className="flex items-center rounded border border-border overflow-hidden">
        {(['es', 'en'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={clsx(
              'px-2.5 py-1 text-2xs font-mono uppercase tracking-wide transition-colors',
              language === lang ? 'bg-moss text-white' : 'text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border bg-surface-2">
          {organization.logoUrl ? (
            <img src={organization.logoUrl} alt={organization.name} className="w-8 object-contain shrink-0" />
          ) : (
            <Building2 size={11} className="text-muted shrink-0" />
          )}
          <div className="flex flex-col leading-none">
            <span className="text-2xs font-mono font-medium text-text tracking-tight">{organization.name}</span>
            <span className="text-2xs font-mono text-muted tracking-wide leading-tight">{organization.specialty}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
