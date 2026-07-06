import type { PreoccupationalExam, XrayExam, FinalExamResult, AptitudeResult } from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';

interface Props {
  exam: PreoccupationalExam;
  onChange: (patch: Partial<PreoccupationalExam>) => void;
}

type FinalExamKey = keyof XrayExam['finalExam'];

const FINAL_EXAM_COLS: FinalExamKey[][] = [
  ['fisico', 'dermatologico', 'osteoarticularMMSS', 'osteoarticularMMII', 'neumonologico', 'neurologico', 'hematologico', 'orl'],
  ['apDigestivo', 'psicologico', 'cardiovascular', 'urologicoNefrologico', 'oftalmologico', 'endocrinologico', 'ginecologico', 'audiometria'],
  ['espirometria', 'laringoscopia', 'rxTx', 'rxCLS', 'rxMunecas', 'ecg', 'laboratorioInespecifico', 'laboratorioToxicologico'],
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-2xs text-muted tracking-widest uppercase font-mono mb-3 pb-1 border-b border-border">
      {children}
    </h3>
  );
}

function SubCheck({ label, checked, disabled, onChange }: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2 py-0.5 pl-6 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-sienna"
      />
      <span className="text-sm font-mono text-text">{label}</span>
    </label>
  );
}

export default function ResultTab({ exam, onChange }: Props) {
  const { t } = useApp();
  const { xrayExam, result } = exam;

  const patchResult = (patch: Partial<typeof result>) =>
    onChange({ result: { ...result, ...patch } });

  const toggleFinal = (key: FinalExamKey, which: FinalExamResult) => {
    const current = xrayExam.finalExam[key];
    const next: FinalExamResult = current === which ? null : which;
    onChange({ xrayExam: { ...xrayExam, finalExam: { ...xrayExam.finalExam, [key]: next } } });
  };

  const selectMainResult = (which: 'normal' | 'inculpableDiseases' | 'abnormal') => {
    const wasAlreadySelected =
      (which === 'normal' && result.normal) ||
      (which === 'inculpableDiseases' && result.inculpableDiseases) ||
      (which === 'abnormal' && result.abnormal);

    if (wasAlreadySelected) {
      patchResult({ normal: false, inculpableDiseases: false, abnormal: false });
    } else {
      patchResult({
        normal: which === 'normal',
        inculpableDiseases: which === 'inculpableDiseases',
        abnormal: which === 'abnormal',
        ...(which !== 'abnormal' && { outOfRangeValues: false, preclinicalAlterations: false, professionalDiseases: false }),
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Examen Final */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.result.finalExam')}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {FINAL_EXAM_COLS.map((col, ci) => (
            <div key={ci}>
              <div className="grid grid-cols-[1fr_3rem_4.5rem] gap-1 pb-1.5 mb-1 border-b border-border">
                <span />
                <span className="text-2xs font-mono text-muted uppercase text-center leading-tight">
                  {t('preoccupational.result.normal')}
                </span>
                <span className="text-2xs font-mono text-muted uppercase text-center leading-tight">
                  {t('preoccupational.result.pathological')}
                </span>
              </div>
              {col.map((key) => {
                const val = xrayExam.finalExam[key];
                return (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_3rem_4.5rem] gap-1 py-1 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs font-mono text-text leading-5">
                      {t(`preoccupational.xray.items.${key}`)}
                    </span>
                    <div className="flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={val === 'normal'}
                        onChange={() => toggleFinal(key, 'normal')}
                        className="accent-moss w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={val === 'pathological'}
                        onChange={() => toggleFinal(key, 'pathological')}
                        className="accent-sienna w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Resultado */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.result.resultSection')}</SectionTitle>

        <p className="text-xs font-mono text-muted leading-relaxed mb-4 p-3 bg-surface-2 rounded border border-border/60">
          {t('preoccupational.result.legalNotice')}
        </p>

        <div className="space-y-1">
          {/* Normal */}
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={result.normal}
              onChange={() => selectMainResult('normal')}
              className="accent-moss"
            />
            <span className="text-sm font-mono text-text font-medium">{t('preoccupational.result.normalResult')}</span>
          </label>

          {/* Enfermedades Inculpables */}
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={result.inculpableDiseases}
              onChange={() => selectMainResult('inculpableDiseases')}
              className="accent-ember"
            />
            <span className="text-sm font-mono text-text font-medium">{t('preoccupational.result.inculpableDiseases')}</span>
          </label>

          {/* Anormal + nested */}
          <div>
            <label className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={result.abnormal}
                onChange={() => selectMainResult('abnormal')}
                className="accent-sienna"
              />
              <span className="text-sm font-mono text-text font-medium">{t('preoccupational.result.abnormal')}</span>
            </label>
            <SubCheck
              label={t('preoccupational.result.outOfRangeValues')}
              checked={result.outOfRangeValues}
              disabled={!result.abnormal}
              onChange={(v) => patchResult({ outOfRangeValues: v })}
            />
            <SubCheck
              label={t('preoccupational.result.preclinicalAlterations')}
              checked={result.preclinicalAlterations}
              disabled={!result.abnormal}
              onChange={(v) => patchResult({ preclinicalAlterations: v })}
            />
            <SubCheck
              label={t('preoccupational.result.professionalDiseases')}
              checked={result.professionalDiseases}
              disabled={!result.abnormal}
              onChange={(v) => patchResult({ professionalDiseases: v })}
            />
          </div>
        </div>
      </section>

      {/* Comentarios */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.result.comments')}</SectionTitle>
        <textarea
          value={result.comments}
          onChange={(e) => patchResult({ comments: e.target.value })}
          rows={4}
          className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm font-mono text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors resize-none"
        />
      </section>

      {/* Conclusión */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.result.conclusion')}</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 mb-5">
          {([
            ['conductExpectantControl', 'preoccupational.result.conductExpectantControl'],
            ['suspendExposureControl', 'preoccupational.result.suspendExposureControl'],
            ['preventionMeasures', 'preoccupational.result.preventionMeasures'],
            ['treatment', 'preoccupational.result.treatment'],
          ] as const).map(([field, key]) => (
            <label key={field} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={result[field]}
                onChange={(e) => patchResult({ [field]: e.target.checked })}
                className="accent-ember"
              />
              <span className="text-sm font-mono text-text">{t(key)}</span>
            </label>
          ))}
        </div>

        <p className="text-2xs font-mono text-muted uppercase tracking-wide mb-2">
          {t('preoccupational.result.aptitude')}
        </p>
        <div className="flex gap-6">
          {(['apt', 'aptWithRestrictions', 'inapt'] as AptitudeResult[]).map((opt) => (
            <label key={opt!} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="aptitude"
                checked={result.aptitude === opt}
                onChange={() => patchResult({ aptitude: opt })}
                className="accent-ember"
              />
              <span className={`text-sm font-mono ${opt === 'apt' ? 'text-moss' : opt === 'aptWithRestrictions' ? 'text-ember' : 'text-sienna'}`}>
                {t(`preoccupational.attachments.aptOptions.${opt!}`)}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
