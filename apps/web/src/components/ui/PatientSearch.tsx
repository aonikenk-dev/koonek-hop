import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { patients, type Patient } from '@/data/mock/patients';

interface PatientSearchProps {
  placeholder?: string;
  onSelect: (patient: Patient) => void;
  onClear?: () => void;
  selectedName?: string;
}

function searchPatients(query: string): Patient[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.documentId.includes(q)
  );
}

export default function PatientSearch({ placeholder, onSelect, onClear, selectedName }: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(searchPatients(query));
      setOpen(query.trim().length > 0);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (patient: Patient) => {
    setQuery('');
    setOpen(false);
    onSelect(patient);
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
          {results.length === 0 ? (
            <div className="px-3 py-2 text-xs font-mono text-muted">Sin resultados</div>
          ) : (
            <ul>
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(patient)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-text truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-muted">
                        {patient.nationalIdType} {patient.documentId}
                      </p>
                    </div>
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
