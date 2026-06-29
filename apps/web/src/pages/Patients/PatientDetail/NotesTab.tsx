import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marked } from 'marked';
import { Eye, Pencil, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/contexts/AIContext';
import { fetchNotesByPatientId } from '@/services/notes';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import LawenAvatar from '@/components/ai/LawenAvatar';

interface NotesTabProps {
  patientId: string;
  value: string | null;
  onChange: (value: string) => void;
}

const CHEATSHEET: { syntax: string; result: string }[] = [
  { syntax: '# Encabezado 1', result: 'Encabezado grande' },
  { syntax: '## Encabezado 2', result: 'Encabezado mediano' },
  { syntax: '**negrita**', result: 'negrita' },
  { syntax: '*itálica*', result: 'itálica' },
  { syntax: '- item', result: 'Lista con viñetas' },
  { syntax: '1. item', result: 'Lista numerada' },
  { syntax: '[texto](https://...)', result: 'Link' },
  { syntax: '`código`', result: 'Código en línea' },
];

export default function NotesTab({ patientId, value, onChange }: NotesTabProps) {
  const { t } = useApp();
  const { aiModuleEnabled } = useAI();
  const [preview, setPreview] = useState(true);
  const [lawenHint, setLawenHint] = useState(false);
  const { data } = useQuery({ queryKey: ['notes', patientId], queryFn: () => fetchNotesByPatientId(patientId) });

  useEffect(() => {
    if (value === null && data !== undefined) onChange(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, data]);

  if (value === null) return <p className="text-sm text-muted">{t('common.loading')}</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{t('patients.detail.descriptions.notes')}</p>
        <div className="flex items-center rounded border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-2xs font-mono uppercase tracking-wide transition-colors',
              !preview ? 'bg-moss text-white' : 'text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            <Pencil size={12} /> {t('notes.write')}
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-2xs font-mono uppercase tracking-wide transition-colors',
              preview ? 'bg-moss text-white' : 'text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            <Eye size={12} /> {t('notes.preview')}
          </button>
        </div>
      </div>

      {!preview && (
        <Section title={t('notes.cheatsheetTitle')} defaultOpen={false}>
          <div className="flex items-start gap-2 text-xs text-muted">
            <HelpCircle size={14} className="text-glacier shrink-0 mt-0.5" />
            <p>{t('notes.cheatsheetHint')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHEATSHEET.map((row) => (
              <div key={row.syntax} className="flex items-center justify-between gap-3 px-3 py-2 rounded bg-surface-2">
                <code className="text-xs font-mono text-sienna">{row.syntax}</code>
                <span className="text-xs text-muted">{row.result}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {preview ? (
        <div
          className="kpi-card prose-koonek min-h-[16rem]"
          dangerouslySetInnerHTML={{ __html: marked.parse(value) as string }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          placeholder={t('notes.placeholder')}
          className="w-full px-4 py-3 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          {aiModuleEnabled && (
            <div className="relative inline-block">
              <Button variant="secondary" leftIcon={<LawenAvatar size={16} />} className="text-xs" onClick={() => setLawenHint(true)}>
                {t('notes.askLawen')}
              </Button>
              {lawenHint && (
                <div className="absolute bottom-full mb-2 left-0 w-64 kpi-card text-xs text-muted">
                  {t('notes.lawenComingSoon')}
                  <button type="button" onClick={() => setLawenHint(false)} className="block mt-2 text-2xs text-moss">
                    {t('common.close')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <Button className="text-xs">{t('common.save')}</Button>
      </div>
    </div>
  );
}
