import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchAppointmentsByDoctorName } from '@/services/appointments';
import Table, { type Column } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Appointment, AppointmentStatus } from '@/data/mock/appointments';

const STATUS_OPTIONS: AppointmentStatus[] = ['scheduled', 'confirmed', 'cancelled', 'done', 'overbooking', 'blocked'];

interface EditForm {
  date: string;
  time: string;
  durationMinutes: string;
  reason: string;
  status: AppointmentStatus;
}

function toForm(a: Appointment): EditForm {
  const start = new Date(a.start);
  const minutes = Math.round((new Date(a.end).getTime() - start.getTime()) / 60_000);
  return {
    date: start.toISOString().slice(0, 10),
    time: start.toTimeString().slice(0, 5),
    durationMinutes: String(minutes),
    reason: a.reason,
    status: a.status,
  };
}

export default function AppointmentsTab({ doctorLabel }: { doctorLabel: string }) {
  const { t } = useApp();
  const { data, isLoading } = useQuery({
    queryKey: ['doctorAppointments', doctorLabel],
    queryFn: () => fetchAppointmentsByDoctorName(doctorLabel),
    enabled: !!doctorLabel,
  });
  const [overrides, setOverrides] = useState<Record<string, Appointment>>({});
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);

  const appointments = (data ?? []).map((a) => overrides[a.id] ?? a);

  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm(toForm(a));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing || !form) return;
    const start = new Date(`${form.date}T${form.time}:00`);
    const end = new Date(start.getTime() + Number(form.durationMinutes) * 60_000);
    setOverrides((prev) => ({
      ...prev,
      [editing.id]: { ...editing, start: start.toISOString(), end: end.toISOString(), reason: form.reason, status: form.status },
    }));
    setEditing(null);
    setForm(null);
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'start',
      header: t('appointments.form.date'),
      render: (a) => new Date(a.start).toLocaleString(),
      className: 'font-mono text-muted',
    },
    { key: 'patientName', header: t('appointments.form.patient'), render: (a) => a.patientName ?? '—' },
    { key: 'reason', header: t('appointments.form.reason'), className: 'text-muted' },
    {
      key: 'status',
      header: t('appointments.form.status'),
      render: (a) => t(`appointments.statusOptions.${a.status}`),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t('doctors.detail.descriptions.appointments')}</p>
      {isLoading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <Table columns={columns} rows={appointments} rowKey={(a) => a.id} onRowClick={openEdit} />
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t('appointments.detailsTitle')} size="sm">
        {form && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label={t('appointments.form.date')}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <Input
                type="time"
                label={t('appointments.form.time')}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
            <Input
              type="number"
              label={t('appointments.form.duration')}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              min={10}
              step={5}
              required
            />
            <Input
              label={t('appointments.form.reason')}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('appointments.form.status')}
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}
                className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t(`appointments.statusOptions.${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="text-xs">
                {t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
