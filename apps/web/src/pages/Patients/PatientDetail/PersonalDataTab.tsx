import { useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchPatientById } from '@/services/patients';
import { fetchPersonalDataByPatientId } from '@/services/personalData';
import type { NationalIdType, BloodType, RhFactor } from '@/data/mock/patients';
import type { BiologicalSex, Gender, Address, ContactPerson } from '@/data/mock/personalData';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface PersonalDataFormValues {
  firstName: string;
  lastName: string;
  nationalIdType: NationalIdType;
  documentId: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  gender: Gender;
  nationality: string;
  bloodType?: BloodType;
  rhFactor?: RhFactor;
  address: Address;
  contactPerson: ContactPerson;
  healthInsuranceCompanyName: string;
  healthInsurancePlanCode: string;
  healthInsuranceCardNumber: string;
  bio: string;
}

interface PersonalDataTabProps {
  patientId: string;
  value: PersonalDataFormValues | null;
  onChange: (value: PersonalDataFormValues) => void;
}

export default function PersonalDataTab({ patientId, value, onChange }: PersonalDataTabProps) {
  const { t } = useApp();
  const { data: patient } = useQuery({ queryKey: ['patient', patientId], queryFn: () => fetchPatientById(patientId) });
  const { data: personalData } = useQuery({
    queryKey: ['personalData', patientId],
    queryFn: () => fetchPersonalDataByPatientId(patientId),
  });

  useEffect(() => {
    if (value || !patient || !personalData) return;
    onChange({
      firstName: patient.firstName,
      lastName: patient.lastName,
      nationalIdType: patient.nationalIdType,
      documentId: patient.documentId,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType,
      rhFactor: patient.rhFactor,
      biologicalSex: personalData.biologicalSex,
      gender: personalData.gender,
      nationality: personalData.nationality,
      address: personalData.address,
      contactPerson: personalData.contactPerson,
      healthInsuranceCompanyName: patient.healthInsurance?.companyName ?? '',
      healthInsurancePlanCode: patient.healthInsurance?.planCode ?? '',
      healthInsuranceCardNumber: patient.healthInsurance?.cardNumber ?? '',
      bio: personalData.bio,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, patient, personalData]);

  if (!value) return <p className="text-sm text-muted">{t('common.loading')}</p>;

  const set = <K extends keyof PersonalDataFormValues>(field: K, fieldValue: PersonalDataFormValues[K]) =>
    onChange({ ...value, [field]: fieldValue });

  const setAddress = (field: keyof Address, fieldValue: string) =>
    onChange({ ...value, address: { ...value.address, [field]: fieldValue } });

  const setContact = (field: keyof ContactPerson, fieldValue: string) =>
    onChange({ ...value, contactPerson: { ...value.contactPerson, [field]: fieldValue } });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mock-only: no backend yet to persist this — kept as an in-session draft.
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('patients.detail.descriptions.personalData')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('patients.detail.personalData.sectionIdentity')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label={t('patients.form.firstName')} value={value.firstName} onChange={(e) => set('firstName', e.target.value)} />
            <Input label={t('patients.form.lastName')} value={value.lastName} onChange={(e) => set('lastName', e.target.value)} />
            <Input label={t('patients.table.documentId')} value={value.documentId} onChange={(e) => set('documentId', e.target.value)} />
            <Input
              type="date"
              label={t('patients.detail.personalData.dateOfBirth')}
              value={value.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
            />
            <Input label={t('patients.detail.personalData.nationality')} value={value.nationality} onChange={(e) => set('nationality', e.target.value)} />
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('patients.detail.personalData.gender')}</label>
              <select
                value={value.gender}
                onChange={(e) => set('gender', e.target.value as Gender)}
                className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
              >
                <option value="f">{t('patients.detail.personalData.genderOptions.f')}</option>
                <option value="m">{t('patients.detail.personalData.genderOptions.m')}</option>
                <option value="no-binario">{t('patients.detail.personalData.genderOptions.noBinario')}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('patients.detail.personalData.sectionContact')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input type="email" label={t('patients.table.email')} value={value.email} onChange={(e) => set('email', e.target.value)} />
            <Input label={t('patients.table.phone')} value={value.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} />
          </div>
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('patients.detail.personalData.sectionAddress')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label={t('patients.detail.personalData.street')} value={value.address.street} onChange={(e) => setAddress('street', e.target.value)} />
            <Input label={t('patients.detail.personalData.city')} value={value.address.city} onChange={(e) => setAddress('city', e.target.value)} />
            <Input label={t('patients.detail.personalData.state')} value={value.address.state} onChange={(e) => setAddress('state', e.target.value)} />
            <Input label={t('patients.detail.personalData.country')} value={value.address.country} onChange={(e) => setAddress('country', e.target.value)} />
          </div>
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('patients.detail.summary.healthInsurance')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('patients.detail.personalData.insuranceCompany')}
              value={value.healthInsuranceCompanyName}
              onChange={(e) => set('healthInsuranceCompanyName', e.target.value)}
            />
            <Input
              label={t('patients.detail.personalData.insurancePlan')}
              value={value.healthInsurancePlanCode}
              onChange={(e) => set('healthInsurancePlanCode', e.target.value)}
            />
            <Input
              label={t('patients.detail.personalData.insuranceCard')}
              value={value.healthInsuranceCardNumber}
              onChange={(e) => set('healthInsuranceCardNumber', e.target.value)}
            />
          </div>
        </section>

        <section className="kpi-card space-y-4">
          <p className="eyebrow">{t('patients.detail.personalData.sectionEmergencyContact')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label={t('patients.form.firstName')} value={value.contactPerson.firstName} onChange={(e) => setContact('firstName', e.target.value)} />
            <Input label={t('patients.form.lastName')} value={value.contactPerson.lastName} onChange={(e) => setContact('lastName', e.target.value)} />
            <Input label={t('patients.table.phone')} value={value.contactPerson.phoneNumber} onChange={(e) => setContact('phoneNumber', e.target.value)} />
            <Input label={t('patients.detail.personalData.bond')} value={value.contactPerson.bond} onChange={(e) => setContact('bond', e.target.value)} />
          </div>
        </section>

        <section className="kpi-card space-y-3">
          <p className="eyebrow">{t('patients.detail.personalData.sectionNotes')}</p>
          <textarea
            value={value.bio}
            onChange={(e) => set('bio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
          />
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
