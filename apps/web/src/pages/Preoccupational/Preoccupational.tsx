import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import {
  type PreoccupationalExam,
  type ExamType,
  type AptitudeResult,
  type ExamRequirements,
  EMPTY_REQUIREMENTS,
} from '@/data/mock/preoccupational';
import {
  listExams,
  createExam,
  searchPatients,
  type PatientSearchResult,
  type ListExamsParams,
} from '@/services/preoccupational';
import Table, { type Column } from '@/components/ui/Table';
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

function fmtDate(d: string | null | undefined) {
  if (!d) return <span className="text-muted">—</span>;
  return <span className="text-sm text-text font-mono">{new Date(d).toLocaleDateString('es-AR')}</span>;
}

type SortOrder = 'asc' | 'desc';

interface TabState {
  page: number;
  sortBy: string;
  sortOrder: SortOrder;
  data: PreoccupationalExam[];
  total: number;
  loading: boolean;
}

interface CreateForm {
  examType: ExamType;
  summonDate: string;
  company: string;
  place: string;
  firstName: string;
  lastName: string;
  nationalIdType: 'DNI' | 'LE' | 'OTRO';
  documentId: string;
  addToPatients: boolean;
  requirements: ExamRequirements;
}

const EMPTY_FORM: CreateForm = {
  examType: 'preoccupational',
  summonDate: new Date().toISOString().split('T')[0],
  company: '',
  place: '',
  firstName: '',
  lastName: '',
  nationalIdType: 'DNI',
  documentId: '',
  addToPatients: true,
  requirements: { ...EMPTY_REQUIREMENTS },
};

const PAGE_LIMIT = 20;

export default function Preoccupational() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { openTab } = useWorkspaceTabs();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [linkedPatient, setLinkedPatient] = useState<PatientSearchResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pending, setPending] = useState<TabState>({
    page: 1, sortBy: 'summonDate', sortOrder: 'asc', data: [], total: 0, loading: true,
  });
  const [completed, setCompleted] = useState<TabState>({
    page: 1, sortBy: 'date', sortOrder: 'desc', data: [], total: 0, loading: true,
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchTab = useCallback(async (
    status: 'draft' | 'completed',
    state: TabState,
    setter: React.Dispatch<React.SetStateAction<TabState>>,
    searchQ: string,
  ) => {
    setter((s) => ({ ...s, loading: true }));
    try {
      const params: ListExamsParams = {
        status,
        page: state.page,
        limit: PAGE_LIMIT,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        search: searchQ || undefined,
      };
      const res = await listExams(params);
      setter((s) => ({ ...s, data: res.data, total: res.pagination.total, loading: false }));
    } catch {
      setter((s) => ({ ...s, loading: false }));
    }
  }, []);

  // Fetch both tabs on mount and whenever their state changes
  useEffect(() => {
    void fetchTab('draft', pending, setPending, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.page, pending.sortBy, pending.sortOrder]);

  useEffect(() => {
    void fetchTab('completed', completed, setCompleted, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed.page, completed.sortBy, completed.sortOrder]);

  // Debounced search refetches both tabs from page 1
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPending((s) => ({ ...s, page: 1 }));
      setCompleted((s) => ({ ...s, page: 1 }));
      void fetchTab('draft', { ...pending, page: 1 }, setPending, search);
      void fetchTab('completed', { ...completed, page: 1 }, setCompleted, search);
    }, 350);
    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSort = (tab: 'pending' | 'completed', key: string) => {
    const setter = tab === 'pending' ? setPending : setCompleted;
    const state = tab === 'pending' ? pending : completed;
    const newOrder: SortOrder = state.sortBy === key && state.sortOrder === 'asc' ? 'desc' : 'asc';
    setter((s) => ({ ...s, sortBy: key, sortOrder: newOrder, page: 1 }));
  };

  const doSearch = useCallback((q: string) => searchPatients(q), []);

  const handlePatientSelect = (result: PatientSearchResult) => {
    setLinkedPatient(result);
    setForm((f) => ({
      ...f,
      firstName: result.firstName,
      lastName: result.lastName,
      nationalIdType: result.nationalIdType,
      documentId: result.documentId,
    }));
  };

  const handlePatientClear = () => {
    setLinkedPatient(null);
    setForm((f) => ({ ...f, firstName: '', lastName: '', documentId: '', nationalIdType: 'DNI' }));
  };

  const handleClose = () => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setLinkedPatient(null);
    setSubmitted(false);
  };

  const formErrors = {
    company:    submitted && !form.company.trim()    ? t('preoccupational.form.errors.company')    : undefined,
    place:      submitted && !form.place.trim()      ? t('preoccupational.form.errors.place')      : undefined,
    documentId: submitted && !form.documentId.trim() ? t('preoccupational.form.errors.documentId') : undefined,
    firstName:  submitted && !form.firstName.trim()  ? t('preoccupational.form.errors.firstName')  : undefined,
    lastName:   submitted && !form.lastName.trim()   ? t('preoccupational.form.errors.lastName')   : undefined,
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!form.company.trim() || !form.place.trim() || !form.documentId.trim() || !form.firstName.trim() || !form.lastName.trim()) return;
    void handleCreate();
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const newExam = await createExam({
        examType: form.examType,
        summonDate: form.summonDate || undefined,
        requirements: form.requirements,
        company: form.company,
        place: form.place,
        patient: {
          firstName: form.firstName,
          lastName: form.lastName,
          nationalIdType: form.nationalIdType,
          documentId: form.documentId,
          linkedPatientId: linkedPatient?.linkedPatientId,
          addToPatients: linkedPatient ? false : form.addToPatients,
          ...(linkedPatient?.source === 'preoccupational' && {
            cuil: linkedPatient.cuil,
            dateOfBirth: linkedPatient.dateOfBirth,
            birthPlace: linkedPatient.birthPlace,
            maritalStatus: linkedPatient.maritalStatus,
            numberOfChildren: linkedPatient.numberOfChildren,
            address: linkedPatient.address,
            city: linkedPatient.city,
            postalCode: linkedPatient.postalCode,
            state: linkedPatient.state,
            country: linkedPatient.country,
          }),
        },
      });
      // Prepend to pending tab
      setPending((s) => ({ ...s, data: [newExam, ...s.data], total: s.total + 1 }));
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setLinkedPatient(null);
      openTab({
        key: `preoccupational:${newExam.id}`,
        kind: 'preoccupational',
        label: `${form.firstName} ${form.lastName}`,
        path: `/preoccupational/${newExam.id}`,
      });
      navigate(`/preoccupational/${newExam.id}`);
    } finally {
      setSaving(false);
    }
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

  const patientCol: Column<PreoccupationalExam> = {
    key: 'patient',
    header: t('preoccupational.table.patient'),
    render: (ex) => (
      <span className="font-mono text-sm text-text">
        {ex.patient.firstName} {ex.patient.lastName}
        <span className="ml-2 text-muted text-xs">{ex.patient.nationalIdType} {ex.patient.documentId}</span>
      </span>
    ),
  };

  const examTypeCol: Column<PreoccupationalExam> = {
    key: 'examType',
    header: t('preoccupational.table.examType'),
    render: (ex) => examTypeBadge(ex.examType),
  };

  const companyCol: Column<PreoccupationalExam> = {
    key: 'company',
    header: t('preoccupational.table.company'),
    sortable: true,
    render: (ex) => <span className="text-sm text-text">{ex.company}</span>,
  };

  const summonDateCol: Column<PreoccupationalExam> = {
    key: 'summonDate',
    header: t('preoccupational.table.summonDate'),
    sortable: true,
    render: (ex) => fmtDate(ex.summonDate),
  };

  const dateCol: Column<PreoccupationalExam> = {
    key: 'date',
    header: t('preoccupational.table.date'),
    sortable: true,
    render: (ex) => fmtDate(ex.date),
  };

  const resultCol: Column<PreoccupationalExam> = {
    key: 'result',
    header: t('preoccupational.table.result'),
    render: (ex) => aptitudeBadge(ex.result.aptitude),
  };

  const pendingColumns: Column<PreoccupationalExam>[] = [patientCol, examTypeCol, summonDateCol, companyCol];
  const completedColumns: Column<PreoccupationalExam>[] = [patientCol, examTypeCol, dateCol, companyCol, resultCol];

  function Pagination({ state, setter }: { state: TabState; setter: React.Dispatch<React.SetStateAction<TabState>> }) {
    const totalPages = Math.ceil(state.total / PAGE_LIMIT);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs font-mono text-muted">
          {(state.page - 1) * PAGE_LIMIT + 1}–{Math.min(state.page * PAGE_LIMIT, state.total)} de {state.total}
        </span>
        <div className="flex gap-1">
          <button
            disabled={state.page <= 1}
            onClick={() => setter((s) => ({ ...s, page: s.page - 1 }))}
            className="p-1.5 rounded hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 py-1 text-xs font-mono text-muted">{state.page} / {totalPages}</span>
          <button
            disabled={state.page >= totalPages}
            onClick={() => setter((s) => ({ ...s, page: s.page + 1 }))}
            className="p-1.5 rounded hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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

      {/* Tabs */}
      <div className="border-b border-border flex gap-0">
        {(['pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-mono border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-moss text-text'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {t(`preoccupational.tabs.${tab}`)}
            <span className={`ml-2 text-2xs px-1.5 py-0.5 rounded font-mono ${activeTab === tab ? 'badge-moss' : 'badge-muted'}`}>
              {tab === 'pending' ? pending.total : completed.total}
            </span>
          </button>
        ))}
      </div>

      {/* Pending tab */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pending.loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted font-mono">{t('common.loading')}</p>
            </div>
          ) : (
            <Table
              rows={pending.data}
              rowKey={(ex) => ex.id}
              columns={pendingColumns}
              onRowClick={handleRowClick}
              emptyMessage={t('preoccupational.empty')}
              sortBy={pending.sortBy}
              sortOrder={pending.sortOrder}
              onSort={(key) => handleSort('pending', key)}
            />
          )}
          <Pagination state={pending} setter={setPending} />
        </div>
      )}

      {/* Completed tab */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completed.loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted font-mono">{t('common.loading')}</p>
            </div>
          ) : (
            <Table
              rows={completed.data}
              rowKey={(ex) => ex.id}
              columns={completedColumns}
              onRowClick={handleRowClick}
              emptyMessage={t('preoccupational.empty')}
              sortBy={completed.sortBy}
              sortOrder={completed.sortOrder}
              onSort={(key) => handleSort('completed', key)}
            />
          )}
          <Pagination state={completed} setter={setCompleted} />
        </div>
      )}

      {/* Create modal */}
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
              label={t('preoccupational.form.summonDate')}
              type="date"
              value={form.summonDate}
              onChange={(e) => setForm((f) => ({ ...f, summonDate: e.target.value }))}
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

          <div className="space-y-2 border border-border rounded-md p-3">
            <p className="text-2xs font-mono text-muted uppercase tracking-widest">{t('preoccupational.form.requirements')}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(['clinicalExam', 'spirometry', 'xray', 'audiometry'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requirements[key]}
                    onChange={(e) => setForm((f) => ({ ...f, requirements: { ...f.requirements, [key]: e.target.checked } }))}
                    className="accent-moss"
                  />
                  <span className="text-sm font-mono text-text">{t(`preoccupational.form.req.${key}`)}</span>
                </label>
              ))}
            </div>
            <div className="space-y-1 mt-1">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('preoccupational.form.req.other')}</label>
              <textarea
                value={form.requirements.other}
                onChange={(e) => setForm((f) => ({ ...f, requirements: { ...f.requirements, other: e.target.value } }))}
                rows={2}
                className="w-full px-3 py-2 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors resize-none"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-muted tracking-widest uppercase mb-2">{t('preoccupational.patientSearch')}</p>
            <PatientSearch
              searchFn={doSearch}
              placeholder={t('preoccupational.patientSearchPlaceholder')}
              onSelect={handlePatientSelect}
              onClear={handlePatientClear}
              selectedName={linkedPatient ? `${linkedPatient.firstName} ${linkedPatient.lastName}` : undefined}
            />
            {linkedPatient && (
              <p className="mt-1.5 text-xs text-moss">
                {linkedPatient.source === 'preoccupational'
                  ? 'Paciente encontrado en exámenes previos — datos pre-cargados.'
                  : t('preoccupational.patientFound')}
              </p>
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

          {submitted && Object.values(formErrors).some(Boolean) && (
            <p className="text-xs text-sienna font-mono">
              Completá todos los campos obligatorios para continuar.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? '...' : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
