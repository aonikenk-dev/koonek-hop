import { useMemo, useState, type FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { EventInput } from '@fullcalendar/core';
import { Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp, type Language } from '@/contexts/AppContext';
import { appointments as mockAppointments, type Appointment, type AppointmentStatus } from '@/data/mock/appointments';
import {
  appointmentConfigs,
  getBackgroundEvents,
  getBusinessHours,
  getSlotDuration,
  includesWeekend,
} from '@/data/mock/appointmentConfig';
import { patients } from '@/data/mock/patients';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// 'expired' is computed, not stored — a scheduled/confirmed appointment whose
// end time has already passed.
type EffectiveStatus = AppointmentStatus | 'expired';

const STATUS_COLOR: Record<EffectiveStatus, string> = {
  scheduled: '#7BAFC4',
  confirmed: '#3D6B4F',
  cancelled: '#C0623A',
  done: '#4E8863',
  overbooking: '#E07A52',
  expired: '#8896A8',
  blocked: '#0D0F12',
};

const DAY_LABELS: Record<Language, string[]> = {
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

function effectiveStatus(appointment: Appointment, now: Date): EffectiveStatus {
  const isPast = new Date(appointment.end) < now;
  if (isPast && (appointment.status === 'scheduled' || appointment.status === 'confirmed')) {
    return 'expired';
  }
  return appointment.status;
}

function formatDays(daysOfWeek: number[], lang: Language): string {
  return daysOfWeek.map((d) => DAY_LABELS[lang][d]).join(', ');
}

type NewAppointmentForm = {
  patientName: string;
  date: string;
  time: string;
  duration: string;
  reason: string;
};

function buildForm(date: Date, durationMinutes: number): NewAppointmentForm {
  return {
    patientName: patients[0] ? `${patients[0].firstName} ${patients[0].lastName}` : '',
    date: date.toISOString().slice(0, 10),
    time: date.toTimeString().slice(0, 5),
    duration: String(durationMinutes),
    reason: '',
  };
}

interface PendingChange {
  appointmentId: string;
  patientName: string;
  newStart: Date;
  newEnd: Date;
  revert: () => void;
}

export default function Appointments() {
  const { t, language } = useApp();
  const [list, setList] = useState<Appointment[]>(mockAppointments);
  const [configId, setConfigId] = useState(appointmentConfigs[0].id);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<NewAppointmentForm>(() => buildForm(new Date(), 30));
  const [confirmDelete, setConfirmDelete] = useState<Appointment | null>(null);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  const activeConfig = appointmentConfigs.find((c) => c.id === configId) ?? appointmentConfigs[0];
  const now = new Date();

  const doctorAppointments = useMemo(
    () => list.filter((a) => a.doctorName === activeConfig.doctorName),
    [list, activeConfig]
  );

  const events = useMemo<EventInput[]>(() => {
    const appointmentEvents: EventInput[] = doctorAppointments.map((a) => {
      const status = effectiveStatus(a, now);
      const locked = status === 'cancelled' || status === 'done' || status === 'blocked';
      return {
        id: a.id,
        title: a.patientName ?? t('appointments.blockedTitle'),
        start: a.start,
        end: a.end,
        backgroundColor: STATUS_COLOR[status],
        borderColor: STATUS_COLOR[status],
        editable: !locked,
        durationEditable: !locked,
        extendedProps: { status, doctorName: a.doctorName, reason: a.reason },
      };
    });
    return [...appointmentEvents, ...getBackgroundEvents(activeConfig)];
  }, [doctorAppointments, activeConfig, now, t]);

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
        doctorName: activeConfig.doctorName,
        start: start.toISOString(),
        end: end.toISOString(),
        reason: form.reason,
        status: 'scheduled',
      },
    ]);
    setCreateOpen(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setList((prev) => prev.filter((a) => a.id !== confirmDelete.id));
    setConfirmDelete(null);
    setSelected(null);
  };

  const dateFormatter = new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeFormatter = new Intl.DateTimeFormat(language === 'es' ? 'es-AR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const confirmReschedule = () => {
    if (!pendingChange) return;
    setList((prev) =>
      prev.map((a) =>
        a.id === pendingChange.appointmentId
          ? { ...a, start: pendingChange.newStart.toISOString(), end: pendingChange.newEnd.toISOString() }
          : a
      )
    );
    setPendingChange(null);
  };

  const cancelReschedule = () => {
    pendingChange?.revert();
    setPendingChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <label className="text-2xs font-mono text-muted uppercase tracking-wide">
            {t('appointments.selectDoctorLabel')}
          </label>
          <select
            value={configId}
            onChange={(e) => setConfigId(e.target.value)}
            className="px-3 py-2 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
          >
            {appointmentConfigs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.doctorName} — {c.description}
              </option>
            ))}
          </select>
          <p className="text-2xs font-mono text-muted max-w-md">
            {activeConfig.sessions
              .map((s) => `${s.sessionType}: ${s.startTime}-${s.endTime} (${formatDays(s.daysOfWeek, language)})`)
              .join(' · ')}
          </p>
        </div>
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={() => setCreateOpen(true)}>
          {t('appointments.new')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="eyebrow !mb-0">{t('appointments.legendTitle')}</span>
        {(Object.keys(STATUS_COLOR) as EffectiveStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5 text-muted">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
            {t(`appointments.statusOptions.${status}`)}
          </span>
        ))}
      </div>

      <div className="koonek-calendar kpi-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={language === 'es' ? esLocale : undefined}
          height="auto"
          customButtons={{
            reloadCalendar: {
              text: t('appointments.reload'),
              click: () => setList(mockAppointments),
            },
          }}
          headerToolbar={{
            left: 'prev,next today reloadCalendar',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay listDay,listWeek,listMonth',
          }}
          views={{
            listDay: { buttonText: t('appointments.listDay') },
            listWeek: { buttonText: t('appointments.listWeek') },
            listMonth: { buttonText: t('appointments.listMonth') },
          }}
          buttonText={{
            today: t('appointments.today'),
            month: t('appointments.month'),
            week: t('appointments.week'),
            day: t('appointments.day'),
          }}
          noEventsContent={() => <div className="py-6 text-center text-sm text-muted">{t('appointments.noEvents')}</div>}
          weekends={includesWeekend(activeConfig)}
          businessHours={getBusinessHours(activeConfig)}
          slotDuration={getSlotDuration(activeConfig)}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          nowIndicator
          weekNumbers
          navLinks
          dayMaxEvents
          dayMaxEventRows={2}
          editable
          eventDurationEditable
          droppable
          selectable
          selectMirror
          selectConstraint="businessHours"
          selectAllow={(selectInfo) => selectInfo.start >= new Date()}
          select={(selectInfo) => {
            const minutes = Math.round((selectInfo.end.getTime() - selectInfo.start.getTime()) / 60_000);
            setForm(buildForm(selectInfo.start, minutes || activeConfig.slotMinutes));
            setCreateOpen(true);
          }}
          eventOverlap={(stillEvent, movingEvent) => {
            const stillStatus = stillEvent.extendedProps.status as EffectiveStatus;
            const movingStatus = movingEvent?.extendedProps.status as EffectiveStatus;
            return stillStatus === 'cancelled' || stillStatus === 'overbooking' || movingStatus === 'overbooking';
          }}
          events={events}
          eventClick={(arg) => {
            const appointment = list.find((a) => a.id === arg.event.id) ?? null;
            setSelected(appointment);
          }}
          eventDrop={(info) =>
            setPendingChange({
              appointmentId: info.event.id,
              patientName: info.event.title,
              newStart: info.event.start ?? new Date(),
              newEnd: info.event.end ?? new Date(),
              revert: info.revert,
            })
          }
          eventResize={(info) =>
            setPendingChange({
              appointmentId: info.event.id,
              patientName: info.event.title,
              newStart: info.event.start ?? new Date(),
              newEnd: info.event.end ?? new Date(),
              revert: info.revert,
            })
          }
          eventContent={(arg) => {
            const status = arg.event.extendedProps.status as EffectiveStatus;
            return (
              <div className={clsx(status === 'cancelled' && 'line-through opacity-70', status === 'blocked' && 'italic')}>
                {status !== 'blocked' && <span className="font-mono text-2xs">{arg.timeText}</span>}{' '}
                <span className="font-mono text-2xs font-medium">{arg.event.title}</span>
              </div>
            );
          }}
          eventDidMount={(info) => {
            const status = info.event.extendedProps.status as EffectiveStatus;
            const doctorName = info.event.extendedProps.doctorName as string;
            const reason = info.event.extendedProps.reason as string;
            const statusLabel = t(`appointments.statusOptions.${status}`);
            info.el.title = `${statusLabel} · ${info.event.title} — ${doctorName} (${reason})`;
            info.el.style.cursor = 'pointer';
            if (status === 'blocked') {
              info.el.style.background =
                'repeating-linear-gradient(45deg, #0D0F12, #0D0F12 10px, #2A3140 10px, #2A3140 20px)';
              info.el.style.color = '#FFFFFF';
            }
          }}
        />
      </div>

      {/* Appointment details */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={t('appointments.detailsTitle')} size="sm">
        {selected && (
          <div className="p-5 space-y-3">
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.patient')}</p>
              <p className="text-sm text-text">{selected.patientName ?? t('appointments.blockedTitle')}</p>
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
              <p className="text-sm text-text">{t(`appointments.statusOptions.${effectiveStatus(selected, now)}`)}</p>
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

          <Input label={t('appointments.form.doctor')} value={activeConfig.doctorName} disabled />

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
        message={t('appointments.deleteConfirm', { name: confirmDelete?.patientName ?? t('appointments.blockedTitle') })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        open={!!pendingChange}
        title={t('appointments.rescheduleTitle')}
        message={
          pendingChange
            ? t('appointments.rescheduleMessage', {
                name: pendingChange.patientName,
                date: dateFormatter.format(pendingChange.newStart),
                time: timeFormatter.format(pendingChange.newStart),
              })
            : ''
        }
        onConfirm={confirmReschedule}
        onCancel={cancelReschedule}
        danger={false}
      />
    </div>
  );
}
