import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface BasePatientResult {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  nationalIdType?: string;
  source?: 'preoccupational' | 'patients';
}

interface PatientSearchProps<T extends BasePatientResult> {
  searchFn: (q: string) => Promise<T[]>;
  onSelect: (result: T) => void;
  onClear?: () => void;
  selectedName?: string;
  placeholder?: string;
}

const SOURCE_BADGE: Record<string, string> = {
  preoccupational: 'badge-glacier',
  patients: 'badge-moss',
};
const SOURCE_LABEL: Record<string, string> = {
  preoccupational: 'Preocupacional',
  patients: 'Pacientes',
};

export default function PatientSearch<T extends BasePatientResult>({
  searchFn,
  onSelect,
  onClear,
  selectedName,
  placeholder,
}: PatientSearchProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchFn(query);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, searchFn]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: T) => {
    setQuery('');
    setOpen(false);
    onSelect(result);
  };

  const handleClear = () => {
    setQuery('');
    setOpen(false);
    onClear?.();
  };

  if (selectedName) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-moss/5 border border-moss/30 rounded text-sm">
        <Search size={14} className="text-moss shrink-0" />
        <span className="flex-1 font-mono text-sm text-text">{selectedName}</span>
        <button type="button" onClick={handleClear} className="text-muted hover:text-sienna transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border rounded focus-within:border-moss/60 transition-colors">
        <Search size={14} className="text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? 'Nombre, apellido o DNI...'}
          className="flex-1 bg-transparent outline-none text-sm font-mono text-text placeholder:text-subtle"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setOpen(false); }} className="text-muted hover:text-text transition-colors">
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface border border-border rounded shadow-card-md overflow-hidden">
          {loading ? (
            <div className="px-3 py-2 text-xs font-mono text-muted">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs font-mono text-muted">Sin resultados</div>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={`${result.source}-${result.id}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-text truncate">
                        {result.firstName} {result.lastName}
                      </p>
                      <p className="text-xs text-muted">
                        {result.nationalIdType ?? 'DNI'} {result.documentId}
                      </p>
                    </div>
                    {result.source && (
                      <span className={`text-2xs shrink-0 ${SOURCE_BADGE[result.source] ?? 'badge-muted'}`}>
                        {SOURCE_LABEL[result.source] ?? result.source}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
