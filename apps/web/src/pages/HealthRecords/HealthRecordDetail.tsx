import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import { fetchPatientById } from '@/services/patients';
import { fetchHealthRecordByPatientId } from '@/services/healthRecords';
import type { HealthRecordEntry } from '@/data/mock/healthRecords';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function HealthRecordDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useApp();
  const { user } = useAuth();
  const { tabs, openTab, setDraftField } = useWorkspaceTabs();
  const [addedEntries, setAddedEntries] = useState<HealthRecordEntry[]>([]);

  const tabKey = `health-record:${id}`;

  const { data: patient } = useQuery({ queryKey: ['patient', id], queryFn: () => fetchPatientById(id) });
  const { data: entries, isLoading } = useQuery({
    queryKey: ['healthRecord', id],
    queryFn: () => fetchHealthRecordByPatientId(id),
  });

  // Self-heal: if this page is opened directly (e.g. browser refresh), make
  // sure it still shows up in the workspace tab bar.
  useEffect(() => {
    if (!tabs.some((tab) => tab.key === tabKey)) {
      openTab({
        key: tabKey,
        kind: 'healthRecord',
        label: patient ? `${patient.firstName} ${patient.lastName}` : t('pages.healthRecords.title'),
        path: `/health-records/${id}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, patient]);

  const draft = tabs.find((tab) => tab.key === tabKey)?.draft ?? {};

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.diagnosis && !draft.notes) return;
    setAddedEntries((prev) => [
      {
        id: `hr-${Date.now()}`,
        patientId: id,
        date: new Date().toISOString().slice(0, 10),
        doctorName: user ? `${user.firstName} ${user.lastName}` : '',
        diagnosis: draft.diagnosis ?? '',
        notes: draft.notes ?? '',
      },
      ...prev,
    ]);
    setDraftField(tabKey, 'diagnosis', '');
    setDraftField(tabKey, 'notes', '');
  };

  const allEntries = [...addedEntries, ...(entries ?? [])];

  const openPatient = () => {
    openTab({
      key: `patient:${id}`,
      kind: 'patient',
      label: patient ? `${patient.firstName} ${patient.lastName}` : t('pages.patients.title'),
      path: `/patients/${id}`,
    });
    navigate(`/patients/${id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="secondary" leftIcon={<User size={14} />} className="text-xs" onClick={openPatient}>
          {t('healthRecords.viewPatient')}
        </Button>
      </div>

      <div className="kpi-card">
        <p className="font-display font-bold text-sm text-text mb-4">{t('healthRecords.newEntry')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('healthRecords.form.diagnosis')}
            value={draft.diagnosis ?? ''}
            onChange={(e) => setDraftField(tabKey, 'diagnosis', e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">
              {t('healthRecords.form.notes')}
            </label>
            <textarea
              value={draft.notes ?? ''}
              onChange={(e) => setDraftField(tabKey, 'notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" leftIcon={<Plus size={14} />} className="text-xs">
              {t('healthRecords.addEntry')}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted">{t('common.loading')}</p>}
        {!isLoading && allEntries.length === 0 && (
          <div className="kpi-card text-sm text-muted text-center py-8">{t('healthRecords.empty')}</div>
        )}
        {allEntries.map((entry) => (
          <div key={entry.id} className="kpi-card">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-sm text-text">{entry.diagnosis}</p>
              <span className="text-2xs font-mono text-muted">{entry.date}</span>
            </div>
            <p className="text-sm text-muted mt-2 leading-relaxed">{entry.notes}</p>
            <p className="text-2xs font-mono text-muted mt-3">
              {t('healthRecords.entryBy')} {entry.doctorName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
