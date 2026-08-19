import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import type { Patient } from '@/data/mock/patients';
import {
  preoccupationalExams,
  type PreoccupationalExam,
  type ExamType,
  type AptitudeResult,
  emptyPreemploymentPatient,
  emptyClinicalExam,
  emptySpirometry,
  emptyXrayExam,
  emptyResult,
} from '@/data/mock/preoccupational';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import PatientSearch from '@/components/ui/PatientSearch';

const APTITUDE_BADGE_CLASS: Partial<Record<NonNullable<AptitudeResult>, string>> = {
  apt: 'badge-moss',
  aptWithPreexistence: 'badge-ember',
  transitoryInapt: 'badge-ember',
  inapt: 'badge-sienna',
  continuesApt: 'badge-moss',
  continuesAptWithRestrictions: 'badge-ember',
  requiresPeriodicControl: 'badge-ember',
  requiresSpecialistConsultation: 'badge-ember',
};

const APTITUDE_BADGE_LABEL: Partial<Record<NonNullable<AptitudeResult>, string>> = {
  apt: 'Apto',
  aptWithPreexistence: 'Apto c/ preexistencia',
  transitoryInapt: 'No apto transitorio',
  inapt: 'No apto',
  continuesApt: 'Apto',
  continuesAptWithRestrictions: 'Apto c/ restricciones',
  requiresPeriodicControl: 'Control periódico',
  requiresSpecialistConsultation: 'Interconsulta',
};

function aptitudeBadge(aptitude: AptitudeResult) {
  if (!aptitude) return <span className="badge-muted">—</span>;
  const cls = APTITUDE_BADGE_CLASS[aptitude] ?? 'badge-muted';
  const label = APTITUDE_BADGE_LABEL[aptitude] ?? aptitude;
  return <span className={cls}>{label}</span>;
}

function examTypeBadge(type: ExamType) {
  const map: Record<ExamType, string> = {
    preoccupational: 'badge-glacier',
    periodic: 'badge-muted',
    egress: 'badge-ember',
  };
  const label: Record<ExamType, string> = {
    preoccupational: 'Pre-ocup.',
    periodic: 'Periódico',
    egress: 'Egreso',
  };
  return <span className={map[type]}>{label[type]}</span>;
}

interface CreateForm {
  examType: ExamType;
  date: string;
  company: string;
  place: string;
  firstName: string;
  lastName: string;
  nationalIdType: 'DNI' | 'LE' | 'OTRO';
  documentId: string;
  addToPatients: boolean;
}

const EMPTY_FORM: CreateForm = {
  examType: 'preoccupational',
  date: new Date().toISOString().split('T')[0],
  company: '',
  place: '',
  firstName: '',
  lastName: '',
  nationalIdType: 'DNI',
  documentId: '',
  addToPatients: true,
};

export default function Preoccupational() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { openTab } = useWorkspaceTabs();

  const [exams, setExams] = useState<PreoccupationalExam[]>(preoccupationalExams);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const formErrors = {
    company:    submitted && !form.company.trim()    ? t('preoccupational.form.errors.company')    : undefined,
    place:      submitted && !form.place.trim()      ? t('preoccupational.form.errors.place')      : undefined,
    documentId: submitted && !form.documentId.trim() ? t('preoccupational.form.errors.documentId') : undefined,
    firstName:  submitted && !form.firstName.trim()  ? t('preoccupational.form.errors.firstName')  : undefined,
    lastName:   submitted && !form.lastName.trim()   ? t('preoccupational.form.errors.lastName')   : undefined,
  };
  const isValid = Object.values(formErrors).every((e) => !e);

  const filtered = exams.filter((ex) => {
    const q = search.toLowerCase();
    return (
      ex.patient.firstName.toLowerCase().includes(q) ||
      ex.patient.lastName.toLowerCase().includes(q) ||
      ex.patient.documentId.includes(q) ||
      ex.company.toLowerCase().includes(q)
    );
  });

  const handlePatientSelect = (patient: Patient) => {
    setLinkedPatient(patient);
    setForm((f) => ({
      ...f,
      firstName: patient.firstName,
      lastName: patient.lastName,
      nationalIdType: patient.nationalIdType,
      documentId: patient.documentId,
    }));
  };

  const handlePatientClear = () => {
    setLinkedPatient(null);
    setForm((f) => ({ ...f, firstName: '', lastName: '', documentId: '' }));
  };

  const handleClose = () => { setShowCreate(false); setForm(EMPTY_FORM); setLinkedPatient(null); setSubmitted(false); };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!form.company.trim() || !form.place.trim() || !form.documentId.trim() || !form.firstName.trim() || !form.lastName.trim()) return;
    handleCreate();
  };

  const handleCreate = () => {
    const id = `preocc-${Date.now()}`;
    const newExam: PreoccupationalExam = {
      id,
      examType: form.examType,
      date: form.date,
      company: form.company,
      place: form.place,
      status: 'draft',
      patient: {
        ...emptyPreemploymentPatient(),
        id: `pp-${Date.now()}`,
        firstName: form.firstName,
        lastName: form.lastName,
        nationalIdType: form.nationalIdType,
        documentId: form.documentId,
        linkedPatientId: linkedPatient?.id,
        addedToPatients: linkedPatient ? false : form.addToPatients,
      },
      position: '',
      tasks: '',
      declaration: { leftJobForHealth: false, pendingCompensation: false, exemptedFromMilitary: false, deniedLifeInsurance: false },
      habitsDeclaration: { smokes: false, drinks: false },
      familyHistory: { hta: false, diabetes: false, neurological: false, neoplastic: false, other: '' },
      medicalHistory: { surgeries: '', conditions: {} as any, medicalObservations: '' },
      personalAntecedents: {
        clinicalSurgicalPathology: '', permanentMedication: false, permanentMedicationDetail: '',
        smokerAmount: '', habits: '', allergic: false, allergicType: '',
        professionalDiseases: '', laborIncapacity: '',
      },
      clinicalExam: emptyClinicalExam(),
      spirometry: emptySpirometry(),
      xrayExam: emptyXrayExam(),
      result: emptyResult(),
      attachments: [],
    };
    preoccupationalExams.unshift(newExam);
    setExams((prev) => [newExam, ...prev]);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setLinkedPatient(null);
    openTab({
      key: `preoccupational:${id}`,
      kind: 'preoccupational',
      label: `${form.firstName} ${form.lastName}`,
      path: `/preoccupational/${id}`,
    });
    navigate(`/preoccupational/${id}`);
  };

  const handleRowClick = (exam: PreoccupationalExam) => {
    openTab({
      key: `preoccupational:${exam.id}`,
      kind: 'preoccupational',
      label: `${exam.patient.firstName} ${exam.patient.lastName}`,
      path: `/preoccupational/${exam.id}`,
    });
    navigate(`/preoccupational/${exam.id}`);
  };

  const columns = [
    {
      key: 'patient',
      header: t('preoccupational.table.patient'),
      render: (ex: PreoccupationalExam) => (
        <span className="font-mono text-sm text-text">
          {ex.patient.firstName} {ex.patient.lastName}
          <span className="ml-2 text-muted text-xs">{ex.patient.nationalIdType} {ex.patient.documentId}</span>
        </span>
      ),
    },
    {
      key: 'examType',
      header: t('preoccupational.table.examType'),
      render: (ex: PreoccupationalExam) => examTypeBadge(ex.examType),
    },
    {
      key: 'date',
      header: t('preoccupational.table.date'),
      render: (ex: PreoccupationalExam) => (
        <span className="text-sm text-text">{new Date(ex.date).toLocaleDateString('es-AR')}</span>
      ),
    },
    {
      key: 'company',
      header: t('preoccupational.table.company'),
      render: (ex: PreoccupationalExam) => <span className="text-sm text-text">{ex.company}</span>,
    },
    {
      key: 'status',
      header: t('preoccupational.table.status'),
      render: (ex: PreoccupationalExam) => (
        <span className={ex.status === 'completed' ? 'badge-moss' : 'badge-muted'}>
          {t(`preoccupational.status.${ex.status}`)}
        </span>
      ),
    },
    {
      key: 'result',
      header: t('preoccupational.table.result'),
      render: (ex: PreoccupationalExam) => aptitudeBadge(ex.result.aptitude),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('preoccupational.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setShowCreate(true)} className="ml-auto text-xs h-9">
          {t('preoccupational.new')}
        </Button>
      </div>

      <Table
        rows={filtered}
        rowKey={(ex) => ex.id}
        columns={columns}
        onRowClick={handleRowClick}
        emptyMessage={t('preoccupational.empty')}
      />

      <Modal
        open={showCreate}
        onClose={handleClose}
        title={t('preoccupational.new')}
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('preoccupational.form.examType')}</label>
              <select
                value={form.examType}
                onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value as ExamType }))}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors"
              >
                <option value="preoccupational">{t('preoccupational.examTypes.preoccupational')}</option>
                <option value="periodic">{t('preoccupational.examTypes.periodic')}</option>
                <option value="egress">{t('preoccupational.examTypes.egress')}</option>
              </select>
            </div>
            <Input
              label={t('preoccupational.form.date')}
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('preoccupational.form.company')}
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              error={formErrors.company}
            />
            <Input
              label={t('preoccupational.form.place')}
              value={form.place}
              onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
              error={formErrors.place}
            />
          </div>

          <div>
            <p className="text-xs font-mono text-muted tracking-widest uppercase mb-2">{t('preoccupational.patientSearch')}</p>
            <PatientSearch
              placeholder={t('preoccupational.patientSearchPlaceholder')}
              onSelect={handlePatientSelect}
              onClear={handlePatientClear}
              selectedName={linkedPatient ? `${linkedPatient.firstName} ${linkedPatient.lastName}` : undefined}
            />
            {linkedPatient && (
              <p className="mt-1.5 text-xs text-moss">{t('preoccupational.patientFound')}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('preoccupational.form.nationalIdType')}</label>
              <select
                value={form.nationalIdType}
                onChange={(e) => setForm((f) => ({ ...f, nationalIdType: e.target.value as 'DNI' | 'LE' | 'OTRO' }))}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors"
              >
                <option value="DNI">DNI</option>
                <option value="LE">LE</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>
            <div className="col-span-2">
              <Input
                label={t('preoccupational.form.documentId')}
                value={form.documentId}
                onChange={(e) => setForm((f) => ({ ...f, documentId: e.target.value }))}
                error={formErrors.documentId}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('preoccupational.form.firstName')}
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              error={formErrors.firstName}
            />
            <Input
              label={t('preoccupational.form.lastName')}
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              error={formErrors.lastName}
            />
          </div>

          {!linkedPatient && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.addToPatients}
                onChange={(e) => setForm((f) => ({ ...f, addToPatients: e.target.checked }))}
                className="accent-ember"
              />
              <span className="text-sm font-mono text-text">{t('preoccupational.addToPatients')}</span>
            </label>
          )}

          {submitted && !isValid && (
            <p className="text-xs text-sienna font-mono">
              Completá todos los campos obligatorios para continuar.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
