import type { PreoccupationalExam, AptitudeResult } from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted font-mono w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-text font-mono">{value ?? '—'}</span>
    </div>
  );
}

const APTITUDE_CLASS: Partial<Record<NonNullable<AptitudeResult>, string>> = {
  apt: 'badge-moss',
  aptWithPreexistence: 'badge-ember',
  transitoryInapt: 'badge-ember',
  inapt: 'badge-sienna',
  continuesApt: 'badge-moss',
  continuesAptWithRestrictions: 'badge-ember',
  requiresPeriodicControl: 'badge-ember',
  requiresSpecialistConsultation: 'badge-ember',
};

const APTITUDE_LABEL: Partial<Record<NonNullable<AptitudeResult>, string>> = {
  apt: 'Apto',
  aptWithPreexistence: 'Apto c/ preexistencia',
  transitoryInapt: 'No apto transitorio',
  inapt: 'No apto',
  continuesApt: 'Apto',
  continuesAptWithRestrictions: 'Apto c/ restricciones',
  requiresPeriodicControl: 'Control periódico',
  requiresSpecialistConsultation: 'Interconsulta',
};

function AptitudeBadge({ aptitude }: { aptitude: AptitudeResult }) {
  if (!aptitude) return <span className="badge-muted">—</span>;
  const cls = APTITUDE_CLASS[aptitude] ?? 'badge-muted';
  const label = APTITUDE_LABEL[aptitude] ?? aptitude;
  return <span className={`${cls} text-sm px-3 py-1`}>{label}</span>;
}

interface Props {
  exam: PreoccupationalExam;
}

export default function SummaryTab({ exam }: Props) {
  const { t } = useApp();
  const { patient, result } = exam;

  const age = patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-surface border border-border rounded-md p-4 space-y-1">
        <p className="text-2xs text-muted tracking-widest uppercase font-mono mb-2">
          {t('preoccupational.summary.patientInfo')}
        </p>
        <InfoRow label={t('preoccupational.form.firstName')} value={patient.firstName} />
        <InfoRow label={t('preoccupational.form.lastName')} value={patient.lastName} />
        <InfoRow
          label={t('preoccupational.form.documentId')}
          value={`${patient.nationalIdType} ${patient.documentId}`}
        />
        {patient.cuil && <InfoRow label={t('preoccupational.form.cuil')} value={patient.cuil} />}
        {patient.dateOfBirth && (
          <InfoRow
            label={t('preoccupational.form.dateOfBirth')}
            value={`${new Date(patient.dateOfBirth).toLocaleDateString('es-AR')}${age ? ` (${age} años)` : ''}`}
          />
        )}
        {patient.birthPlace && <InfoRow label={t('preoccupational.form.birthPlace')} value={patient.birthPlace} />}
        {patient.maritalStatus && (
          <InfoRow label={t('preoccupational.form.maritalStatus')} value={patient.maritalStatus} />
        )}
        {patient.numberOfChildren > 0 && (
          <InfoRow label={t('preoccupational.form.numberOfChildren')} value={String(patient.numberOfChildren)} />
        )}
        {patient.address && (
          <InfoRow
            label={t('preoccupational.form.address')}
            value={`${patient.address}, ${patient.city}${patient.state ? `, ${patient.state}` : ''}`}
          />
        )}
      </div>

      <div className="bg-surface border border-border rounded-md p-4 space-y-1">
        <p className="text-2xs text-muted tracking-widest uppercase font-mono mb-2">
          {t('preoccupational.summary.examInfo')}
        </p>
        <InfoRow
          label={t('preoccupational.table.examType')}
          value={t(`preoccupational.examTypes.${exam.examType}`)}
        />
        <InfoRow label={t('preoccupational.form.date')} value={new Date(exam.date).toLocaleDateString('es-AR')} />
        <InfoRow label={t('preoccupational.form.company')} value={exam.company} />
        {exam.place && <InfoRow label={t('preoccupational.summary.place')} value={exam.place} />}
        {exam.position && <InfoRow label={t('preoccupational.summary.position')} value={exam.position} />}
        {exam.tasks && <InfoRow label={t('preoccupational.summary.tasks')} value={exam.tasks} />}
        <InfoRow
          label={t('preoccupational.table.status')}
          value={
            <span className={exam.status === 'completed' ? 'badge-moss' : 'badge-muted'}>
              {t(`preoccupational.status.${exam.status}`)}
            </span>
          }
        />
      </div>

      <div className="bg-surface border border-border rounded-md p-4 space-y-3">
        <p className="text-2xs text-muted tracking-widest uppercase font-mono mb-2">
          {t('preoccupational.summary.resultInfo')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{t('preoccupational.attachments.aptitude')}</span>
          <AptitudeBadge aptitude={result.aptitude} />
        </div>
        {result.comments && (
          <div className="mt-2 p-3 bg-surface-2 rounded text-sm font-mono text-text leading-relaxed">
            {result.comments}
          </div>
        )}
        {exam.attachments.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-1">{t('preoccupational.attachments.sectionTitle')}</p>
            <ul className="space-y-1">
              {exam.attachments.map((att) => (
                <li key={att.id} className="text-xs font-mono text-text flex items-center gap-2">
                  <span className="badge-muted">{t(`preoccupational.attachments.categories.${att.category}`)}</span>
                  {att.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
