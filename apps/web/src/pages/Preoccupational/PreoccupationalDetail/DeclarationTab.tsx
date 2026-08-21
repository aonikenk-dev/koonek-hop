import type { PreoccupationalExam, ExamRequirements, ExamType } from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';
import Input from '@/components/ui/Input';
import FileUploader from '@/components/ui/FileUploader';

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

export default function DeclarationTab({ exam, onChange }: Props) {
  const { t } = useApp();

  const locked = exam.status === 'completed';
  const req = exam.requirements ?? { clinicalExam: false, spirometry: false, xray: false, audiometry: false, other: '' };
  const setReq = (patch: Partial<ExamRequirements>) => { if (!locked) onChange({ requirements: { ...req, ...patch } }); };

  return (
    <div className="space-y-6">
      {/* Datos del Examen */}
      <section className="bg-surface border border-border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Datos del Examen</SectionTitle>
          {locked && (
            <span className="text-2xs font-mono text-muted badge-muted">Solo lectura</span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('preoccupational.form.examType')}</label>
            <select
              value={exam.examType}
              disabled={locked}
              onChange={(e) => onChange({ examType: e.target.value as ExamType })}
              className="w-full px-3 py-2.5 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="preoccupational">{t('preoccupational.examTypes.preoccupational')}</option>
              <option value="periodic">{t('preoccupational.examTypes.periodic')}</option>
              <option value="egress">{t('preoccupational.examTypes.egress')}</option>
            </select>
          </div>
          <Input
            label={t('preoccupational.form.summonDate')}
            type="date"
            value={exam.summonDate ?? ''}
            disabled={locked}
            onChange={(e) => onChange({ summonDate: e.target.value || null })}
          />
          <Input
            label={t('preoccupational.form.date')}
            type="date"
            value={exam.date ? exam.date.slice(0, 10) : ''}
            disabled={locked}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-2xs font-mono text-muted uppercase tracking-widest">{t('preoccupational.form.requirements')}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(['clinicalExam', 'spirometry', 'xray', 'audiometry'] as const).map((key) => (
              <label key={key} className={`flex items-center gap-2 py-0.5 ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={req[key]}
                  disabled={locked}
                  onChange={(e) => setReq({ [key]: e.target.checked })}
                  className="accent-ember"
                />
                <span className="text-sm font-mono text-text">{t(`preoccupational.form.req.${key}`)}</span>
              </label>
            ))}
          </div>
          <div className="space-y-1 mt-1">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('preoccupational.form.req.other')}</label>
            <textarea
              value={req.other}
              disabled={locked}
              onChange={(e) => setReq({ other: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </section>

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
            label={t('preoccupational.form.dateOfBirth')}
            type="date"
            value={exam.patient.dateOfBirth}
            onChange={(e) =>
              onChange({ patient: { ...exam.patient, dateOfBirth: e.target.value } })
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

      {/* Declaración Jurada — file uploader */}
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.declaration.declarationJurada')}</SectionTitle>

        <FileUploader
          files={exam.swornDeclarationFiles ?? []}
          onChange={(files) => onChange({ swornDeclarationFiles: files })}
        />
      </section>
    </div>
  );
}
