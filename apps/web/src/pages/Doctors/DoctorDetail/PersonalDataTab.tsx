import { useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchDoctorById } from '@/services/doctors';
import type { DoctorNationalIdType, BiologicalSex, DoctorGender, DoctorAddress } from '@/data/mock/doctors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface DoctorPersonalDataValues {
  firstName: string;
  lastName: string;
  nationalIdType: DoctorNationalIdType;
  documentId: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  gender: DoctorGender;
  nationality: string;
  address: DoctorAddress;
}

interface PersonalDataTabProps {
  doctorId: string;
  value: DoctorPersonalDataValues | null;
  onChange: (value: DoctorPersonalDataValues) => void;
}

export default function PersonalDataTab({ doctorId, value, onChange }: PersonalDataTabProps) {
  const { t } = useApp();
  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
  });

  useEffect(() => {
    if (value || !doctor) return;
    onChange({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      nationalIdType: doctor.nationalIdType,
      documentId: doctor.documentId,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      dateOfBirth: doctor.dateOfBirth,
      biologicalSex: doctor.biologicalSex,
      gender: doctor.gender,
      nationality: doctor.nationality,
      address: { ...doctor.address },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, doctor]);

  if (!value) return <p className="text-sm text-muted">{t('common.loading')}</p>;

  const set = <K extends keyof DoctorPersonalDataValues>(field: K, v: DoctorPersonalDataValues[K]) =>
    onChange({ ...value, [field]: v });

  const setAddress = (field: keyof DoctorAddress, v: string) =>
    onChange({ ...value, address: { ...value.address, [field]: v } });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const SELECT_CLASS =
    'w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('doctors.detail.descriptions.personalData')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('doctors.detail.personalData.sectionIdentity')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('doctors.form.firstName')}
              value={value.firstName}
              onChange={(e) => set('firstName', e.target.value)}
            />
            <Input
              label={t('doctors.form.lastName')}
              value={value.lastName}
              onChange={(e) => set('lastName', e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('patients.table.documentId')}
              </label>
              <div className="flex gap-2">
                <select
                  value={value.nationalIdType}
                  onChange={(e) => set('nationalIdType', e.target.value as DoctorNationalIdType)}
                  className={SELECT_CLASS + ' w-24 shrink-0'}
                >
                  <option value="DNI">DNI</option>
                  <option value="LE">LE</option>
                  <option value="OTRO">Otro</option>
                </select>
                <Input
                  value={value.documentId}
                  onChange={(e) => set('documentId', e.target.value)}
                />
              </div>
            </div>
            <Input
              type="date"
              label={t('doctors.detail.personalData.dateOfBirth')}
              value={value.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
            />
            <Input
              label={t('doctors.detail.personalData.nationality')}
              value={value.nationality}
              onChange={(e) => set('nationality', e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('doctors.detail.personalData.biologicalSex')}
              </label>
              <select
                value={value.biologicalSex}
                onChange={(e) => set('biologicalSex', e.target.value as BiologicalSex)}
                className={SELECT_CLASS}
              >
                <option value="m">{t('doctors.detail.personalData.sexOptions.m')}</option>
                <option value="f">{t('doctors.detail.personalData.sexOptions.f')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('doctors.detail.personalData.gender')}
              </label>
              <select
                value={value.gender}
                onChange={(e) => set('gender', e.target.value as DoctorGender)}
                className={SELECT_CLASS}
              >
                <option value="cisgenero">{t('doctors.detail.personalData.genderOptions.cisgenero')}</option>
                <option value="transgenero">{t('doctors.detail.personalData.genderOptions.transgenero')}</option>
                <option value="no-binario">{t('doctors.detail.personalData.genderOptions.noBinario')}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('doctors.detail.personalData.sectionContact')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              type="email"
              label={t('patients.table.email')}
              value={value.email}
              onChange={(e) => set('email', e.target.value)}
            />
            <Input
              label={t('patients.table.phone')}
              value={value.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
            />
          </div>
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('doctors.detail.personalData.sectionAddress')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label={t('doctors.detail.personalData.street')}
              value={value.address.street}
              onChange={(e) => setAddress('street', e.target.value)}
            />
            <Input
              label={t('doctors.detail.personalData.city')}
              value={value.address.city}
              onChange={(e) => setAddress('city', e.target.value)}
            />
            <Input
              label={t('doctors.detail.personalData.state')}
              value={value.address.state}
              onChange={(e) => setAddress('state', e.target.value)}
            />
            <Input
              label={t('doctors.detail.personalData.country')}
              value={value.address.country}
              onChange={(e) => setAddress('country', e.target.value)}
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
