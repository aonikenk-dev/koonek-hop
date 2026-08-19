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

// Options that require a detail text input
const NEEDS_DETAIL: AptitudeResult[] = [
  'aptWithPreexistence', 'transitoryInapt', 'inapt',
  'continuesAptWithRestrictions', 'requiresPeriodicControl', 'requiresSpecialistConsultation',
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

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-ember/10 text-ember border border-ember/20">
      {children}
    </span>
  );
}

function PreexistingGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-2xs font-mono text-muted uppercase tracking-widest">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => <InfoChip key={item}>{item}</InfoChip>)}
      </div>
    </div>
  );
}

function PreexistingConditions({ exam, t }: { exam: PreoccupationalExam; t: (k: string) => string }) {
  const { habitsDeclaration, familyHistory, personalAntecedents, spirometry } = exam;

  const habits: string[] = [
    ...(habitsDeclaration.smokes ? [t('preoccupational.declaration.smokes')] : []),
    ...(habitsDeclaration.drinks ? [t('preoccupational.declaration.drinks')] : []),
  ];

  const family: string[] = [
    ...(familyHistory.hta ? ['HTA'] : []),
    ...(familyHistory.diabetes ? ['Diabetes'] : []),
    ...(familyHistory.neurological ? [t('preoccupational.declaration.neurological')] : []),
    ...(familyHistory.neoplastic ? [t('preoccupational.declaration.neoplastic')] : []),
    ...(familyHistory.other?.trim() ? [familyHistory.other.trim()] : []),
  ];

  const personal: string[] = [
    ...(personalAntecedents.clinicalSurgicalPathology?.trim() && personalAntecedents.clinicalSurgicalPathology.trim().toLowerCase() !== 'no'
      ? [personalAntecedents.clinicalSurgicalPathology.trim()] : []),
    ...(personalAntecedents.permanentMedication
      ? [personalAntecedents.permanentMedicationDetail?.trim()
          ? `Medicación permanente: ${personalAntecedents.permanentMedicationDetail.trim()}`
          : 'Medicación permanente']
      : []),
    ...(personalAntecedents.allergic
      ? [personalAntecedents.allergicType?.trim()
          ? `Alérgico: ${personalAntecedents.allergicType.trim()}`
          : 'Alérgico']
      : []),
    ...(personalAntecedents.professionalDiseases?.trim() ? [personalAntecedents.professionalDiseases.trim()] : []),
    ...(personalAntecedents.laborIncapacity?.trim() ? [`Incapacidad laboral: ${personalAntecedents.laborIncapacity.trim()}`] : []),
  ];

  const respiratory: string[] = [
    ...(spirometry.frequentColds ? ['Resfríos frecuentes'] : []),
    ...(spirometry.sinusitis ? ['Sinusitis'] : []),
    ...(spirometry.prolongedBronchitis ? ['Bronquitis prolongada'] : []),
    ...(spirometry.asthma ? ['Asma'] : []),
    ...(spirometry.pneumonia ? ['Neumonía'] : []),
    ...(spirometry.tbc ? ['TBC'] : []),
    ...(spirometry.pleurisy ? ['Pleuritis'] : []),
    ...(spirometry.pneumothorax ? ['Neumotórax'] : []),
    ...(spirometry.kyphosis ? ['Cifosis'] : []),
    ...(spirometry.scoliosis ? ['Escoliosis'] : []),
    ...(spirometry.arterialHypertension ? ['HTA'] : []),
    ...(spirometry.valvulopathy ? ['Valvulopatía'] : []),
    ...(spirometry.coronaryDisease ? ['Enfermedad coronaria'] : []),
    ...(spirometry.currentDyspnea ? ['Disnea'] : []),
    ...(spirometry.currentCough ? ['Tos actual'] : []),
    ...(spirometry.currentThoracicPain ? ['Dolor torácico'] : []),
  ];

  const hasAny = habits.length + family.length + personal.length + respiratory.length > 0;

  if (!hasAny) {
    return <p className="text-sm font-mono text-muted">{t('preoccupational.attachments.preexistingEmpty')}</p>;
  }

  return (
    <div className="space-y-4">
      <PreexistingGroup title={t('preoccupational.attachments.preexistingHabits')} items={habits} />
      <PreexistingGroup title={t('preoccupational.attachments.preexistingFamily')} items={family} />
      <PreexistingGroup title={t('preoccupational.attachments.preexistingPersonal')} items={personal} />
      <PreexistingGroup title={t('preoccupational.attachments.preexistingRespiratory')} items={respiratory} />
    </div>
  );
}

export default function ResultTab({ exam, onChange }: Props) {
  const { t } = useApp();
  const { xrayExam, result } = exam;

  const patchResult = (patch: Partial<typeof result>) =>
    onChange({ result: { ...result, ...patch } });

  const toggleFinal = (key: FinalExamKey, which: FinalExamResult) => {
    const current = xrayExam.finalExam && xrayExam.finalExam[key];
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

  const selectAptitude = (value: AptitudeResult) => {
    patchResult({ aptitude: value, aptitudeDetail: '' });
  };

  const preoccupationalOptions: { value: AptitudeResult; color: string }[] = [
    { value: 'apt',               color: 'text-moss' },
    { value: 'aptWithPreexistence', color: 'text-ember' },
    { value: 'transitoryInapt',   color: 'text-ember' },
    { value: 'inapt',             color: 'text-sienna' },
  ];

  const periodicOptions: { value: AptitudeResult; color: string }[] = [
    { value: 'continuesApt',                   color: 'text-moss' },
    { value: 'continuesAptWithRestrictions',    color: 'text-ember' },
    { value: 'requiresPeriodicControl',         color: 'text-ember' },
    { value: 'requiresSpecialistConsultation',  color: 'text-ember' },
  ];

  const aptitudeOptions = exam.examType === 'periodic' ? periodicOptions : preoccupationalOptions;

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
                const val = xrayExam.finalExam && xrayExam.finalExam[key];
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
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={result.normal}
              onChange={() => selectMainResult('normal')}
              className="accent-moss"
            />
            <span className="text-sm font-mono text-text font-medium">{t('preoccupational.result.normalResult')}</span>
          </label>

          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={result.inculpableDiseases}
              onChange={() => selectMainResult('inculpableDiseases')}
              className="accent-ember"
            />
            <span className="text-sm font-mono text-text font-medium">{t('preoccupational.result.inculpableDiseases')}</span>
          </label>

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
                checked={result && result[field]}
                onChange={(e) => patchResult({ [field]: e.target.checked })}
                className="accent-ember"
              />
              <span className="text-sm font-mono text-text">{t(key)}</span>
            </label>
          ))}
        </div>

        <p className="text-2xs font-mono text-muted uppercase tracking-wide mb-3">
          {t('preoccupational.result.aptitude')}
        </p>

        <div className="space-y-2">
          {aptitudeOptions.map(({ value, color }) => {
            const isSelected = result.aptitude === value;
            const needsDetail = NEEDS_DETAIL.includes(value);
            return (
              <div key={value!}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aptitude"
                    checked={isSelected}
                    onChange={() => selectAptitude(value)}
                    className="accent-ember"
                  />
                  <span className={`text-sm font-mono ${color}`}>
                    {t(`preoccupational.attachments.aptOptions.${value!}`)}
                  </span>
                </label>
                {needsDetail && isSelected && (
                  <input
                    type="text"
                    value={result.aptitudeDetail ?? ''}
                    onChange={(e) => patchResult({ aptitudeDetail: e.target.value })}
                    placeholder={t('preoccupational.attachments.aptOptions.detailPlaceholder')}
                    className="mt-1 ml-6 w-full max-w-md px-3 py-1.5 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Enfermedades Preexistentes (read-only) */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.attachments.preexistingConditions')}</SectionTitle>
        <PreexistingConditions exam={exam} t={t} />
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
    </div>
  );
}
