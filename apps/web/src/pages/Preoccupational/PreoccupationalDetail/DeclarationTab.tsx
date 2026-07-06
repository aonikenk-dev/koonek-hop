import type { PreoccupationalExam, MedicalConditions } from '@/data/mock/preoccupational';
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

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-ember"
      />
      <span className="text-sm font-mono text-text">{label}</span>
    </label>
  );
}

const CONDITION_KEYS: (keyof MedicalConditions)[] = [
  'dizziness', 'excessiveNervousness', 'convulsions', 'headaches', 'insomnia', 'memoryLoss',
  'neuritis', 'brucellosis', 'depression', 'malaria', 'rheumaticFever', 'venerealDiseases',
  'tuberculosis', 'cancer', 'asthma', 'urticaria', 'skinDiseases', 'visionDisorders',
  'hearingLoss', 'earDischarge', 'frequentColds', 'badTeeth', 'recurrentAngina',
  'chronicCough', 'sinusitis', 'bloodInSputum', 'nightSweats', 'weightLoss',
  'chestPain', 'shortnessOfBreath', 'heartPalpitations', 'highBloodPressure',
  'gastricUlcer', 'acidity', 'frequentIndigestion', 'jaundice', 'hernias', 'hemorrhoids',
  'painfulJoints', 'urinationDifficulties', 'fracturesOrDislocations', 'flatFeet',
  'kneePain', 'backPain', 'shoulderPain', 'varicoseVeins',
];

const COLS = 3;

export default function DeclarationTab({ exam, onChange }: Props) {
  const { t } = useApp();

  const setCondition = (key: keyof MedicalConditions, value: boolean) => {
    onChange({
      medicalHistory: {
        ...exam.medicalHistory,
        conditions: { ...exam.medicalHistory.conditions, [key]: value },
      },
    });
  };

  const colSize = Math.ceil(CONDITION_KEYS.length / COLS);
  const cols: (keyof MedicalConditions)[][] = Array.from({ length: COLS }, (_, i) =>
    CONDITION_KEYS.slice(i * colSize, (i + 1) * colSize)
  );

  return (
    <div className="space-y-6">
      {/* Datos Laborales */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.laborData')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('preoccupational.form.company')}
            value={exam.company}
            onChange={(e) => onChange({ company: e.target.value })}
          />
          <Input
            label={t('preoccupational.summary.position')}
            value={exam.position}
            onChange={(e) => onChange({ position: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <Input
            label={t('preoccupational.summary.tasks')}
            value={exam.tasks}
            onChange={(e) => onChange({ tasks: e.target.value })}
          />
        </div>
      </section>

      {/* Datos Personales */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.personalData')}</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label={t('preoccupational.form.maritalStatus')}
            value={exam.patient.maritalStatus}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, maritalStatus: e.target.value } })
            }
          />
          <Input
            label={t('preoccupational.form.numberOfChildren')}
            type="number"
            min={0}
            value={String(exam.patient.numberOfChildren)}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, numberOfChildren: parseInt(e.target.value) || 0 } })
            }
          />
          <Input
            label={t('preoccupational.form.birthPlace')}
            value={exam.patient.birthPlace}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, birthPlace: e.target.value } })
            }
          />
          <Input
            label={t('preoccupational.form.cuil')}
            value={exam.patient.cuil}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, cuil: e.target.value } })
            }
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <div className="col-span-2">
            <Input
              label={t('preoccupational.form.address')}
              value={exam.patient.address}
              onChange={(e) =>
                onChange({ patient: { ...exam.patient, address: e.target.value } })
              }
            />
          </div>
          <Input
            label={t('preoccupational.form.city')}
            value={exam.patient.city}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, city: e.target.value } })
            }
          />
          <Input
            label={t('preoccupational.form.state')}
            value={exam.patient.state}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, state: e.target.value } })
            }
          />
          <Input
            label={t('preoccupational.form.postalCode')}
            value={exam.patient.postalCode}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, postalCode: e.target.value } })
            }
          />
          <Input
            label={t('preoccupational.form.country')}
            value={exam.patient.country}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, country: e.target.value } })
            }
          />
        </div>
      </section>

      {/* Hábitos */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.habits')}</SectionTitle>
        <div className="flex gap-6">
          <CheckField
            label={t('preoccupational.declaration.smokes')}
            checked={exam.habitsDeclaration.smokes}
            onChange={(v) =>
              onChange({ habitsDeclaration: { ...exam.habitsDeclaration, smokes: v } })
            }
          />
          <CheckField
            label={t('preoccupational.declaration.drinks')}
            checked={exam.habitsDeclaration.drinks}
            onChange={(v) =>
              onChange({ habitsDeclaration: { ...exam.habitsDeclaration, drinks: v } })
            }
          />
        </div>
      </section>

      {/* Antecedentes Familiares */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.familyHistory')}</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 mb-3">
          {(['hta', 'diabetes', 'neurological', 'neoplastic'] as const).map((key) => (
            <CheckField
              key={key}
              label={t(`preoccupational.declaration.${key}`)}
              checked={exam.familyHistory[key] as boolean}
              onChange={(v) =>
                onChange({ familyHistory: { ...exam.familyHistory, [key]: v } })
              }
            />
          ))}
        </div>
        <Input
          label={t('preoccupational.declaration.other')}
          value={exam.familyHistory.other}
          onChange={(e) =>
            onChange({ familyHistory: { ...exam.familyHistory, other: e.target.value } })
          }
        />
      </section>

      {/* Antecedentes Médicos */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.medicalHistory')}</SectionTitle>
        <div className="grid grid-cols-3 gap-x-6">
          {cols.map((col, ci) => (
            <div key={ci} className="space-y-0.5">
              {col.map((key) => (
                <CheckField
                  key={key}
                  label={t(`preoccupational.declaration.conditions.${key}`)}
                  checked={exam.medicalHistory.conditions[key] ?? false}
                  onChange={(v) => setCondition(key, v)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input
            label={t('preoccupational.declaration.surgeries')}
            value={exam.medicalHistory.surgeries}
            onChange={(e) =>
              onChange({ medicalHistory: { ...exam.medicalHistory, surgeries: e.target.value } })
            }
          />
          <Input
            label={t('preoccupational.declaration.medicalObservations')}
            value={exam.medicalHistory.medicalObservations}
            onChange={(e) =>
              onChange({
                medicalHistory: { ...exam.medicalHistory, medicalObservations: e.target.value },
              })
            }
          />
        </div>
      </section>

      {/* Declaración Jurada */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.declarationJurada')}</SectionTitle>
        <div className="space-y-2">
          {(
            ['leftJobForHealth', 'pendingCompensation', 'exemptedFromMilitary', 'deniedLifeInsurance'] as const
          ).map((key) => (
            <CheckField
              key={key}
              label={t(`preoccupational.declaration.${key}`)}
              checked={exam.declaration[key]}
              onChange={(v) => onChange({ declaration: { ...exam.declaration, [key]: v } })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
