import { useMemo, useState, type FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { EventInput } from '@fullcalendar/core';
import { Plus, Trash2, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp, type Language } from '@/contexts/AppContext';
import { appointments as mockAppointments, type Appointment, type AppointmentStatus, type PaymentType, type PaymentMethod } from '@/data/mock/appointments';
import {
  appointmentConfigs,
  getBackgroundEvents,
  getBusinessHours,
  getSlotDuration,
  includesWeekend,
} from '@/data/mock/appointmentConfig';
import { patients } from '@/data/mock/patients';
import { fetchAvailableSlots, type TimeSlot } from '@/services/appointments';
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
  patientId: string;
  date: string;
  time: string;
  healthInsuranceLabel: string;
  bookingType: 'appointment' | 'overbooking';
  paymentType: PaymentType | '';
  paymentMethod: PaymentMethod | '';
  amount: string;
  reason: string;
  sendWhatsapp: boolean;
};

function getInsuranceOptions(patientId: string): Array<{ label: string; value: string }> {
  const patient = patients.find((p) => p.id === patientId);
  const opts: Array<{ label: string; value: string }> = [];
  if (patient?.healthInsurance) {
    const ins = patient.healthInsurance;
    opts.push({ label: `${ins.companyName} ${ins.planCode}`, value: `${ins.companyName} ${ins.planCode}` });
  }
  patient?.secondaryInsurances?.forEach((ins) => {
    opts.push({ label: `${ins.companyName} ${ins.planCode}`, value: `${ins.companyName} ${ins.planCode}` });
  });
  return opts;
}

function buildForm(date: Date, patientId: string): NewAppointmentForm {
  const primaryIns = patients.find((p) => p.id === patientId)?.healthInsurance;
  return {
    patientId,
    date: date.toISOString().slice(0, 10),
    time: '',
    healthInsuranceLabel: primaryIns ? `${primaryIns.companyName} ${primaryIns.planCode}` : '',
    bookingType: 'appointment',
    paymentType: '',
    paymentMethod: '',
    amount: '',
    reason: '',
    sendWhatsapp: true,
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
  const [form, setForm] = useState<NewAppointmentForm>(() => buildForm(new Date(), patients[0]?.id ?? ''));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
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

  const patchForm = (patch: Partial<NewAppointmentForm>) => setForm((f) => ({ ...f, ...patch }));

  const handlePatientChange = (patientId: string) => {
    const primaryIns = patients.find((p) => p.id === patientId)?.healthInsurance;
    patchForm({
      patientId,
      healthInsuranceLabel: primaryIns ? `${primaryIns.companyName} ${primaryIns.planCode}` : '',
    });
    setSlotPickerOpen(false);
    setSlots([]);
  };

  const handleDateChange = (date: string) => {
    patchForm({ date });
    setSlotPickerOpen(false);
    setSlots([]);
  };

  const loadSlots = async () => {
    if (!form.date) return;
    if (slotPickerOpen) { setSlotPickerOpen(false); return; }
    setSlotsLoading(true);
    setSlotPickerOpen(true);
    try {
      const result = await fetchAvailableSlots(activeConfig.doctorName, form.date);
      setSlots(result);
    } finally {
      setSlotsLoading(false);
    }
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setSlotPickerOpen(false);
    setSlots([]);
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === form.patientId);
    const start = new Date(`${form.date}T${form.time}:00`);
    const end = new Date(start.getTime() + activeConfig.slotMinutes * 60_000);
    const status: AppointmentStatus = form.bookingType === 'overbooking' ? 'overbooking' : 'scheduled';
    setList((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        patientId: form.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
        doctorName: activeConfig.doctorName,
        start: start.toISOString(),
        end: end.toISOString(),
        reason: form.reason,
        status,
        healthInsuranceLabel: form.healthInsuranceLabel || undefined,
        paymentType: form.paymentType || undefined,
        paymentMethod: form.paymentMethod || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        sendWhatsapp: form.sendWhatsapp,
      },
    ]);
    closeCreateModal();
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
        <Button
          leftIcon={<Plus size={14} />}
          className="text-xs"
          onClick={() => {
            setForm(buildForm(new Date(), patients[0]?.id ?? ''));
            setSlotPickerOpen(false);
            setSlots([]);
            setCreateOpen(true);
          }}
        >
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
            setForm(buildForm(selectInfo.start, patients[0]?.id ?? ''));
            setSlotPickerOpen(false);
            setSlots([]);
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
      <Modal open={createOpen} onClose={closeCreateModal} title={t('appointments.new')} size="md">
        <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto">

          {/* Patient */}
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('appointments.form.patient')}</label>
            <select
              value={form.patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <Input label={t('appointments.form.doctor')} value={activeConfig.doctorName} disabled />

          {/* Date + Time + slot picker trigger */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label={t('appointments.form.date')}
                value={form.date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                  {t('appointments.form.time')}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => patchForm({ time: e.target.value })}
                    required
                    className="flex-1 min-w-0 px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors"
                  />
                  <button
                    type="button"
                    title={t('appointments.form.slots.loadButton')}
                    onClick={() => { void loadSlots(); }}
                    className={clsx(
                      'px-2.5 rounded border transition-colors shrink-0',
                      slotPickerOpen
                        ? 'border-moss bg-moss/10 text-moss'
                        : 'border-border bg-surface text-muted hover:text-moss hover:border-moss'
                    )}
                  >
                    <Clock size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Slot picker panel */}
            {slotPickerOpen && (
              <div className="border border-border rounded-md p-3 bg-surface-2 space-y-3">
                {slotsLoading ? (
                  <p className="text-xs font-mono text-muted text-center py-2">
                    {t('appointments.form.slots.loading')}
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-xs font-mono text-muted text-center py-2">
                    {t('appointments.form.slots.noSlots')}
                  </p>
                ) : (
                  Array.from(new Set(slots.map((s) => s.sessionType))).map((sessionType) => (
                    <div key={sessionType}>
                      <p className="text-2xs font-mono text-muted uppercase tracking-widest mb-2">{sessionType}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {slots
                          .filter((s) => s.sessionType === sessionType)
                          .map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => { patchForm({ time: slot.time }); setSlotPickerOpen(false); }}
                              className={clsx(
                                'px-2.5 py-1 text-xs font-mono rounded transition-colors',
                                !slot.available
                                  ? 'bg-surface text-muted/40 cursor-not-allowed line-through'
                                  : form.time === slot.time
                                    ? 'bg-moss text-white'
                                    : 'bg-moss/10 text-moss hover:bg-moss/20 cursor-pointer'
                              )}
                            >
                              {slot.time}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Health insurance */}
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">
              {t('appointments.form.healthInsurance')}
            </label>
            <select
              value={form.healthInsuranceLabel}
              onChange={(e) => patchForm({ healthInsuranceLabel: e.target.value })}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
            >
              {getInsuranceOptions(form.patientId).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
              <option value="">{t('appointments.form.noInsurance')}</option>
            </select>
          </div>

          {/* Booking type + Payment type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('appointments.form.bookingType')}
              </label>
              <div className="flex gap-1">
                {(['appointment', 'overbooking'] as const).map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => patchForm({ bookingType: bt })}
                    className={clsx(
                      'flex-1 px-2 py-2 text-xs font-mono rounded border transition-colors',
                      form.bookingType === bt
                        ? 'border-moss bg-moss/10 text-moss font-medium'
                        : 'border-border text-muted hover:border-moss/50 hover:text-text'
                    )}
                  >
                    {t(`appointments.bookingTypeOptions.${bt}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                {t('appointments.form.paymentType')}
              </label>
              <div className="flex gap-1">
                {(['consultation', 'no_charge', 'copay'] as const).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => patchForm({
                      paymentType: pt,
                      ...(pt === 'no_charge' && { paymentMethod: '', amount: '' }),
                    })}
                    className={clsx(
                      'flex-1 px-2 py-2 text-xs font-mono rounded border transition-colors',
                      form.paymentType === pt
                        ? 'border-moss bg-moss/10 text-moss font-medium'
                        : 'border-border text-muted hover:border-moss/50 hover:text-text'
                    )}
                  >
                    {t(`appointments.paymentTypeOptions.${pt}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment method + Amount (conditional) */}
          {(form.paymentType === 'consultation' || form.paymentType === 'copay') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                  {t('appointments.form.paymentMethod')}
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => patchForm({ paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
                >
                  <option value="">—</option>
                  <option value="cash">{t('appointments.paymentMethodOptions.cash')}</option>
                  <option value="transfer">{t('appointments.paymentMethodOptions.transfer')}</option>
                </select>
              </div>
              <Input
                type="number"
                label={t('appointments.form.amount')}
                value={form.amount}
                onChange={(e) => patchForm({ amount: e.target.value })}
                min={0}
                step={100}
                placeholder="0"
              />
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">
              {t('appointments.form.reason')}
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => patchForm({ reason: e.target.value })}
              required
              rows={2}
              placeholder="Describí el motivo de la consulta..."
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors resize-none"
            />
          </div>

          {/* WhatsApp confirmation */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.sendWhatsapp}
              onChange={(e) => patchForm({ sendWhatsapp: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-border accent-moss"
            />
            <span className="text-sm font-mono text-text group-hover:text-moss transition-colors">
              {t('appointments.form.sendWhatsapp')}
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="text-xs" onClick={closeCreateModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="text-xs" disabled={!form.time}>
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
