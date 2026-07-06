import { useEffect, type FormEvent } from 'react';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchDoctorById } from '@/services/doctors';
import type { License, LicenseType, DoctorStatus } from '@/data/mock/doctors';
import { SPECIALITY_OPTIONS } from '@/data/mock/doctors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface DoctorProfessionalValues {
  specialities: string[];
  licenses: [Partial<License>, Partial<License>];
  room: string;
  status: DoctorStatus;
  bio: string;
}

interface ProfessionalTabProps {
  doctorId: string;
  value: DoctorProfessionalValues | null;
  onChange: (value: DoctorProfessionalValues) => void;
}

const EMPTY_LICENSE: Partial<License> = { licenseType: undefined, licenseId: '' };

export default function ProfessionalTab({ doctorId, value, onChange }: ProfessionalTabProps) {
  const { t } = useApp();
  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
  });

  useEffect(() => {
    if (value || !doctor) return;
    onChange({
      specialities: [...doctor.specialities],
      licenses: [
        doctor.licenses[0] ? { ...doctor.licenses[0] } : { ...EMPTY_LICENSE },
        doctor.licenses[1] ? { ...doctor.licenses[1] } : { ...EMPTY_LICENSE },
      ],
      room: doctor.room,
      status: doctor.status,
      bio: doctor.bio ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, doctor]);

  if (!value) return <p className="text-sm text-muted">{t('common.loading')}</p>;

  const toggleSpeciality = (s: string) => {
    const next = value.specialities.includes(s)
      ? value.specialities.filter((x) => x !== s)
      : [...value.specialities, s];
    onChange({ ...value, specialities: next });
  };

  const setLicense = (idx: 0 | 1, field: keyof License, v: string) => {
    const lic: [Partial<License>, Partial<License>] = [{ ...value.licenses[0] }, { ...value.licenses[1] }];
    lic[idx] = { ...lic[idx], [field]: v };
    onChange({ ...value, licenses: lic });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const SELECT_CLASS =
    'w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('doctors.detail.descriptions.professional')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('doctors.detail.professional.sectionSpecialities')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
            {SPECIALITY_OPTIONS.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value.specialities.includes(s)}
                  onChange={() => toggleSpeciality(s)}
                  className="accent-moss rounded"
                />
                <span className={clsx(
                  'text-sm font-mono transition-colors',
                  value.specialities.includes(s) ? 'text-text' : 'text-muted group-hover:text-text'
                )}>
                  {s}
                </span>
              </label>
            ))}
          </div>
          {value.specialities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {value.specialities.map((s) => (
                <span key={s} className="badge-glacier text-xs">{s}</span>
              ))}
            </div>
          )}
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('doctors.detail.professional.sectionLicenses')}</p>
          {([0, 1] as const).map((idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                  {idx === 0
                    ? t('doctors.detail.professional.license1')
                    : t('doctors.detail.professional.license2')}
                  {' — '}
                  {t('doctors.detail.professional.licenseType')}
                </label>
                <select
                  value={value.licenses[idx]?.licenseType ?? ''}
                  onChange={(e) => setLicense(idx, 'licenseType', e.target.value as LicenseType)}
                  className={SELECT_CLASS}
                >
                  <option value="">{t('doctors.detail.professional.noLicense')}</option>
                  <option value="mn">{t('doctors.detail.professional.licenseTypes.mn')}</option>
                  <option value="mp">{t('doctors.detail.professional.licenseTypes.mp')}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input
                  label={t('doctors.detail.professional.licenseId')}
                  value={value.licenses[idx]?.licenseId ?? ''}
                  onChange={(e) => setLicense(idx, 'licenseId', e.target.value)}
                  disabled={!value.licenses[idx]?.licenseType}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('doctors.detail.professional.sectionAdmin')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('doctors.detail.professional.room')}
              value={value.room}
              onChange={(e) => onChange({ ...value, room: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('doctors.table.status')}
              </label>
              <select
                value={value.status}
                onChange={(e) => onChange({ ...value, status: e.target.value as DoctorStatus })}
                className={SELECT_CLASS}
              >
                <option value="active">{t('doctors.statusOptions.active')}</option>
                <option value="inactive">{t('doctors.statusOptions.inactive')}</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">
              {t('doctors.detail.professional.bio')}
            </label>
            <textarea
              value={value.bio}
              onChange={(e) => onChange({ ...value, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" className="text-xs">
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
