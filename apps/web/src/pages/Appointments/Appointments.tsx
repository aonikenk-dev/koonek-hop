import { useMemo, useState, type FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { appointments as mockAppointments, type Appointment, type AppointmentStatus } from '@/data/mock/appointments';
import { patients } from '@/data/mock/patients';
import { doctors } from '@/data/mock/doctors';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  scheduled: '#7BAFC4',
  confirmed: '#3D6B4F',
  cancelled: '#C0623A',
};

type NewAppointmentForm = {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  duration: string;
  reason: string;
};

function defaultForm(): NewAppointmentForm {
  const now = new Date();
  return {
    patientName: patients[0]?.firstName ? `${patients[0].firstName} ${patients[0].lastName}` : '',
    doctorName: doctors[0] ?? '',
    date: now.toISOString().slice(0, 10),
    time: '09:00',
    duration: '30',
    reason: '',
  };
}

function renderEventContent(arg: EventContentArg) {
  const status = arg.event.extendedProps.status as AppointmentStatus;
  return (
    <div className={status === 'cancelled' ? 'opacity-60 line-through' : undefined}>
      <span className="font-mono text-2xs">{arg.timeText}</span>{' '}
      <span className="font-mono text-2xs font-medium">{arg.event.title}</span>
    </div>
  );
}

export default function Appointments() {
  const { t } = useApp();
  const [list, setList] = useState<Appointment[]>(mockAppointments);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Appointment | null>(null);
  const [form, setForm] = useState<NewAppointmentForm>(defaultForm);

  const events = useMemo(
    () =>
      list.map((a) => ({
        id: a.id,
        title: a.patientName,
        start: a.start,
        end: a.end,
        backgroundColor: STATUS_COLOR[a.status],
        borderColor: STATUS_COLOR[a.status],
        extendedProps: { status: a.status, doctorName: a.doctorName, reason: a.reason },
      })),
    [list]
  );

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = list.find((a) => a.id === arg.event.id) ?? null;
    setSelected(appointment);
  };

  const set = (field: keyof NewAppointmentForm, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const start = new Date(`${form.date}T${form.time}:00`);
    const end = new Date(start.getTime() + Number(form.duration) * 60_000);
    setList((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        patientName: form.patientName,
        doctorName: form.doctorName,
        start: start.toISOString(),
        end: end.toISOString(),
        reason: form.reason,
        status: 'scheduled',
      },
    ]);
    setCreateOpen(false);
    setForm(defaultForm());
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setList((prev) => prev.filter((a) => a.id !== confirmDelete.id));
    setConfirmDelete(null);
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={() => setCreateOpen(true)}>
          {t('appointments.new')}
        </Button>
      </div>

      <div className="koonek-calendar kpi-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          buttonText={{
            today: t('appointments.today'),
            month: t('appointments.month'),
            week: t('appointments.week'),
            day: t('appointments.day'),
            list: t('appointments.list'),
          }}
          locale={undefined}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
        />
      </div>

      {/* Appointment details */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={t('appointments.detailsTitle')} size="sm">
        {selected && (
          <div className="p-5 space-y-3">
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.patient')}</p>
              <p className="text-sm text-text">{selected.patientName}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.doctor')}</p>
              <p className="text-sm text-text">{selected.doctorName}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.reason')}</p>
              <p className="text-sm text-text">{selected.reason}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.status')}</p>
              <p className="text-sm text-text">{t(`appointments.statusOptions.${selected.status}`)}</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="danger"
                className="text-xs"
                leftIcon={<Trash2 size={13} />}
                onClick={() => setConfirmDelete(selected)}
              >
                {t('appointments.delete')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New appointment */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('appointments.new')} size="sm">
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.patient')}</label>
            <select
              value={form.patientName}
              onChange={(e) => set('patientName', e.target.value)}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
            >
              {patients.map((p) => (
                <option key={p.id} value={`${p.firstName} ${p.lastName}`}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.doctor')}</label>
            <select
              value={form.doctorName}
              onChange={(e) => set('doctorName', e.target.value)}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
            >
              {doctors.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t('appointments.form.date')}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
            <Input
              type="time"
              label={t('appointments.form.time')}
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              required
            />
          </div>

          <Input
            type="number"
            label={t('appointments.form.duration')}
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            min={10}
            step={5}
            required
          />

          <Input
            label={t('appointments.form.reason')}
            value={form.reason}
            onChange={(e) => set('reason', e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="text-xs">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        title={t('appointments.delete')}
        message={t('appointments.deleteConfirm', { name: confirmDelete?.patientName ?? '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
