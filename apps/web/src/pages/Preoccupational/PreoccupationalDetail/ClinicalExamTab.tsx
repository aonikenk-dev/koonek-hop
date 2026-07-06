import type { PreoccupationalExam, ClinicalExam } from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';
import Input from '@/components/ui/Input';

interface Props {
  exam: PreoccupationalExam;
  onChange: (patch: Partial<PreoccupationalExam>) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-2xs text-muted tracking-widest uppercase font-mono mb-3 pb-1 border-b border-border">
      {children}
    </h3>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-ember font-mono mb-2">{title}</p>
      {children}
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-0.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-ember" />
      <span className="text-sm font-mono text-text">{label}</span>
    </label>
  );
}

export default function ClinicalExamTab({ exam, onChange }: Props) {
  const { t } = useApp();
  const { clinicalExam: ce, personalAntecedents: pa } = exam;

  const setCE = (patch: Partial<ClinicalExam>) =>
    onChange({ clinicalExam: { ...ce, ...patch } });

  const setPA = (patch: Partial<typeof pa>) =>
    onChange({ personalAntecedents: { ...pa, ...patch } });

  return (
    <div className="space-y-5">
      {/* Antecedentes Personales */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.clinicalExam.personalAntecedents')}</SectionTitle>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('preoccupational.clinicalExam.clinicalSurgicalPathology')}
              value={pa.clinicalSurgicalPathology}
              onChange={(e) => setPA({ clinicalSurgicalPathology: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.professionalDiseases')}
              value={pa.professionalDiseases}
              onChange={(e) => setPA({ professionalDiseases: e.target.value })}
            />
          </div>
          <CheckField
            label={t('preoccupational.clinicalExam.permanentMedication')}
            checked={pa.permanentMedication}
            onChange={(v) => setPA({ permanentMedication: v })}
          />
          {pa.permanentMedication && (
            <Input
              label={t('preoccupational.clinicalExam.permanentMedicationDetail')}
              value={pa.permanentMedicationDetail}
              onChange={(e) => setPA({ permanentMedicationDetail: e.target.value })}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <CheckField
              label={t('preoccupational.clinicalExam.allergic')}
              checked={pa.allergic}
              onChange={(v) => setPA({ allergic: v })}
            />
          </div>
          {pa.allergic && (
            <Input
              label={t('preoccupational.clinicalExam.allergicType')}
              value={pa.allergicType}
              onChange={(e) => setPA({ allergicType: e.target.value })}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('preoccupational.clinicalExam.smokerAmount')}
              value={pa.smokerAmount}
              onChange={(e) => setPA({ smokerAmount: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.habits')}
              value={pa.habits}
              onChange={(e) => setPA({ habits: e.target.value })}
            />
          </div>
          <Input
            label={t('preoccupational.clinicalExam.laborIncapacity')}
            value={pa.laborIncapacity}
            onChange={(e) => setPA({ laborIncapacity: e.target.value })}
          />
        </div>
      </section>

      {/* Examen Clínico */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.clinicalExam.clinicalExamSection')}</SectionTitle>

        <SubSection title={t('preoccupational.clinicalExam.general')}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              label={t('preoccupational.clinicalExam.height')}
              value={ce.height}
              onChange={(e) => setCE({ height: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.weight')}
              value={ce.weight}
              onChange={(e) => setCE({ weight: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.habit')}
              value={ce.habit}
              onChange={(e) => setCE({ habit: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.gait')}
              value={ce.gait}
              onChange={(e) => setCE({ gait: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.generalState')}
              value={ce.generalState}
              onChange={(e) => setCE({ generalState: e.target.value })}
            />
          </div>
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.skin')}>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-1 mb-2">
            {(
              ['skinNormal', 'skinEczemas', 'skinJaundice', 'skinDermatitis', 'skinBurns', 'skinScars'] as const
            ).map((k) => (
              <CheckField
                key={k}
                label={t(`preoccupational.clinicalExam.${k}`)}
                checked={ce[k]}
                onChange={(v) => setCE({ [k]: v })}
              />
            ))}
          </div>
          <Input
            label={t('preoccupational.clinicalExam.skinLocation')}
            value={ce.skinLocation}
            onChange={(e) => setCE({ skinLocation: e.target.value })}
          />
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.eyes')}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label={`${t('preoccupational.clinicalExam.eyeRight')} — ${t('preoccupational.clinicalExam.nearVision')}`}
              value={ce.eyeRightNearVision}
              onChange={(e) => setCE({ eyeRightNearVision: e.target.value })}
            />
            <Input
              label={`${t('preoccupational.clinicalExam.eyeRight')} — ${t('preoccupational.clinicalExam.colorVision')}`}
              value={ce.eyeRightColorVision}
              onChange={(e) => setCE({ eyeRightColorVision: e.target.value })}
            />
            <Input
              label={`${t('preoccupational.clinicalExam.eyeLeft')} — ${t('preoccupational.clinicalExam.nearVision')}`}
              value={ce.eyeLeftNearVision}
              onChange={(e) => setCE({ eyeLeftNearVision: e.target.value })}
            />
            <Input
              label={`${t('preoccupational.clinicalExam.eyeLeft')} — ${t('preoccupational.clinicalExam.colorVision')}`}
              value={ce.eyeLeftColorVision}
              onChange={(e) => setCE({ eyeLeftColorVision: e.target.value })}
            />
          </div>
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.orl')}>
          <div className="flex gap-6">
            <CheckField
              label={`${t('preoccupational.clinicalExam.nasalSeptum')} ${t('preoccupational.clinicalExam.normal')}`}
              checked={ce.nasalSeptumNormal}
              onChange={(v) => setCE({ nasalSeptumNormal: v })}
            />
            <CheckField
              label={`${t('preoccupational.clinicalExam.hearingRight')} ${t('preoccupational.clinicalExam.normal')}`}
              checked={ce.hearingRightNormal}
              onChange={(v) => setCE({ hearingRightNormal: v })}
            />
            <CheckField
              label={`${t('preoccupational.clinicalExam.hearingLeft')} ${t('preoccupational.clinicalExam.normal')}`}
              checked={ce.hearingLeftNormal}
              onChange={(v) => setCE({ hearingLeftNormal: v })}
            />
          </div>
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.respiratory')}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1 mb-2">
            <CheckField label={t('preoccupational.clinicalExam.emphysema')} checked={ce.respiratoryEmphysema} onChange={(v) => setCE({ respiratoryEmphysema: v })} />
            <CheckField label={t('preoccupational.clinicalExam.asthma')} checked={ce.respiratoryAsthma} onChange={(v) => setCE({ respiratoryAsthma: v })} />
            <CheckField label={t('preoccupational.clinicalExam.dyspnea')} checked={ce.respiratoryDyspnea} onChange={(v) => setCE({ respiratoryDyspnea: v })} />
            <CheckField label={t('preoccupational.clinicalExam.thoraxNormal')} checked={ce.respiratoryThoraxNormal} onChange={(v) => setCE({ respiratoryThoraxNormal: v })} />
            <CheckField label={t('preoccupational.clinicalExam.auscultationNormal')} checked={ce.respiratoryAuscultationNormal} onChange={(v) => setCE({ respiratoryAuscultationNormal: v })} />
          </div>
          <Input
            label={t('preoccupational.clinicalExam.observations')}
            value={ce.respiratoryObservations}
            onChange={(e) => setCE({ respiratoryObservations: e.target.value })}
          />
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.abdomen')}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1 mb-2">
            <CheckField label={t('preoccupational.clinicalExam.normal')} checked={ce.abdomenNormal} onChange={(v) => setCE({ abdomenNormal: v })} />
            <CheckField label={t('preoccupational.clinicalExam.hepatomegaly')} checked={ce.abdomenHepatomegaly} onChange={(v) => setCE({ abdomenHepatomegaly: v })} />
            <CheckField label={t('preoccupational.clinicalExam.splenomegaly')} checked={ce.abdomenSplenomegaly} onChange={(v) => setCE({ abdomenSplenomegaly: v })} />
            <CheckField label={t('preoccupational.clinicalExam.hernias')} checked={ce.abdomenHernias} onChange={(v) => setCE({ abdomenHernias: v })} />
            <CheckField label={t('preoccupational.clinicalExam.eventrations')} checked={ce.abdomenEventrations} onChange={(v) => setCE({ abdomenEventrations: v })} />
          </div>
          {ce.abdomenHernias && (
            <Input
              label={t('preoccupational.clinicalExam.herniaLocation')}
              value={ce.abdomenHerniaLocation}
              onChange={(e) => setCE({ abdomenHerniaLocation: e.target.value })}
            />
          )}
          {ce.abdomenEventrations && (
            <Input
              label={t('preoccupational.clinicalExam.eventrationLocations')}
              value={ce.abdomenEventrationLocations}
              onChange={(e) => setCE({ abdomenEventrationLocations: e.target.value })}
            />
          )}
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.cardiovascular')}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label={t('preoccupational.clinicalExam.bp')}
              placeholder="120/80"
              value={ce.cardiovascularBP}
              onChange={(e) => setCE({ cardiovascularBP: e.target.value })}
            />
            <Input
              label={t('preoccupational.clinicalExam.pulse')}
              placeholder="72"
              value={ce.cardiovascularPulse}
              onChange={(e) => setCE({ cardiovascularPulse: e.target.value })}
            />
            <CheckField label={t('preoccupational.clinicalExam.auscultationNormal')} checked={ce.cardiovascularAuscultationNormal} onChange={(v) => setCE({ cardiovascularAuscultationNormal: v })} />
            <CheckField label={t('preoccupational.clinicalExam.rhythmNormal')} checked={ce.cardiovascularRhythmNormal} onChange={(v) => setCE({ cardiovascularRhythmNormal: v })} />
          </div>
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.musculo')}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
            <CheckField label={`${t('preoccupational.clinicalExam.lumbarSacral')} ${t('preoccupational.clinicalExam.normal')}`} checked={ce.musculoLumbarSacralNormal} onChange={(v) => setCE({ musculoLumbarSacralNormal: v })} />
            <CheckField label={`${t('preoccupational.clinicalExam.cervical')} ${t('preoccupational.clinicalExam.normal')}`} checked={ce.musculoCervicalNormal} onChange={(v) => setCE({ musculoCervicalNormal: v })} />
            <CheckField label={`${t('preoccupational.clinicalExam.dorsal')} ${t('preoccupational.clinicalExam.normal')}`} checked={ce.musculoDorsalNormal} onChange={(v) => setCE({ musculoDorsalNormal: v })} />
            <CheckField label={`${t('preoccupational.clinicalExam.upperLimbs')} ${t('preoccupational.clinicalExam.normal')}`} checked={ce.musculoUpperLimbsNormal} onChange={(v) => setCE({ musculoUpperLimbsNormal: v })} />
            <CheckField label={`${t('preoccupational.clinicalExam.lowerLimbs')} ${t('preoccupational.clinicalExam.normal')}`} checked={ce.musculoLowerLimbsNormal} onChange={(v) => setCE({ musculoLowerLimbsNormal: v })} />
            <CheckField label={`${t('preoccupational.clinicalExam.varicoseVeins')} ${t('preoccupational.clinicalExam.normal')}`} checked={ce.musculoVaricoseVeinsNormal} onChange={(v) => setCE({ musculoVaricoseVeinsNormal: v })} />
          </div>
        </SubSection>

        <SubSection title={t('preoccupational.clinicalExam.neuro')}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1">
            <CheckField label={t('preoccupational.clinicalExam.epilepsy')} checked={ce.neuroEpilepsy} onChange={(v) => setCE({ neuroEpilepsy: v })} />
            <CheckField label={t('preoccupational.clinicalExam.vertigo')} checked={ce.neuroVertigo} onChange={(v) => setCE({ neuroVertigo: v })} />
            <CheckField label={t('preoccupational.clinicalExam.tremors')} checked={ce.neuroTremors} onChange={(v) => setCE({ neuroTremors: v })} />
            <CheckField label={t('preoccupational.clinicalExam.gaitDisorder')} checked={ce.neuroGaitDisorder} onChange={(v) => setCE({ neuroGaitDisorder: v })} />
            <CheckField label={t('preoccupational.clinicalExam.reflexesNormal')} checked={ce.neuroReflexesNormal} onChange={(v) => setCE({ neuroReflexesNormal: v })} />
          </div>
        </SubSection>

        <div>
          <label className="block text-xs text-muted mb-1">
            {t('preoccupational.clinicalExam.clinicalObservations')}
          </label>
          <textarea
            value={ce.clinicalObservations}
            onChange={(e) => setCE({ clinicalObservations: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm font-mono text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors resize-none"
          />
        </div>
      </section>
    </div>
  );
}
