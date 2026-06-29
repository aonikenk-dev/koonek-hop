import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Bot, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import {
  agents as mockAgents,
  AGENT_TYPES,
  AGENT_MODULES,
  type Agent,
  type AgentType,
  type AgentModule,
} from '@/data/mock/agents';
import Table, { type Column } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface AgentForm {
  name: string;
  description: string;
  type: AgentType;
  module: AgentModule;
}

function buildForm(source?: Agent): AgentForm {
  return source
    ? { name: source.name, description: source.description, type: source.type, module: source.module }
    : { name: '', description: '', type: AGENT_TYPES[0], module: AGENT_MODULES[0] };
}

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Agent } | null;

const TYPE_BADGE: Record<AgentType, string> = {
  monitoring: 'badge-glacier',
  reporting: 'badge-moss',
  automation: 'badge-sienna',
  support: 'badge-muted',
};

export default function Agents() {
  const { t } = useApp();
  const [list, setList] = useState<Agent[]>(mockAgents);
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [form, setForm] = useState<AgentForm>(() => buildForm());
  const [confirmDelete, setConfirmDelete] = useState<Agent | null>(null);

  const filtered = typeFilter === 'all' ? list : list.filter((a) => a.type === typeFilter);

  const total = list.length;
  const active = list.filter((a) => a.status === 'active').length;
  const inactive = total - active;

  const openCreate = () => {
    setForm(buildForm());
    setModalState({ mode: 'create' });
  };
  const openEdit = (a: Agent) => {
    setForm(buildForm(a));
    setModalState({ mode: 'edit', data: a });
  };

  const toggleStatus = (id: string) =>
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a)));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (modalState?.mode === 'edit') {
      setList((prev) => prev.map((a) => (a.id === modalState.data.id ? { ...a, ...form } : a)));
    } else {
      setList((prev) => [
        ...prev,
        { id: `ag-${Date.now()}`, ...form, status: 'active', schedule: new Date().toISOString() },
      ]);
    }
    setModalState(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setList((prev) => prev.filter((a) => a.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const columns: Column<Agent>[] = [
    {
      key: 'name',
      header: t('ai.agents.table.name'),
      render: (a) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-moss/10 flex items-center justify-center shrink-0">
            <Bot size={12} className="text-moss" />
          </div>
          <div>
            <p className="text-sm text-text font-medium">{a.name}</p>
            <p className="text-2xs text-muted">{a.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('ai.agents.table.type'),
      render: (a) => <span className={clsx(TYPE_BADGE[a.type], 'text-2xs')}>{t(`ai.agents.types.${a.type}`)}</span>,
    },
    { key: 'module', header: t('ai.agents.table.module'), render: (a) => t(`ai.agents.modules.${a.module}`) },
    {
      key: 'schedule',
      header: t('ai.agents.table.nextRun'),
      render: (a) => new Date(a.schedule).toLocaleString(),
      className: 'font-mono text-muted',
    },
    {
      key: 'lastRun',
      header: t('ai.agents.table.lastRun'),
      render: (a) => (a.lastRun ? new Date(a.lastRun).toLocaleString() : t('ai.agents.never')),
      className: 'font-mono text-muted',
    },
    {
      key: 'status',
      header: t('ai.agents.table.status'),
      render: (a) => (
        <div className="flex items-center gap-2">
          <Toggle checked={a.status === 'active'} onChange={() => toggleStatus(a.id)} />
          {a.status === 'active' ? (
            <CheckCircle2 size={13} className="text-moss" />
          ) : (
            <XCircle size={13} className="text-muted" />
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-16',
      render: (a) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(a);
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(a);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <p className="font-display font-bold text-2xl text-text">{total}</p>
          <p className="text-xs text-muted mt-1">{t('ai.agents.kpi.total')}</p>
        </div>
        <div className="kpi-card">
          <p className="font-display font-bold text-2xl text-moss">{active}</p>
          <p className="text-xs text-muted mt-1">{t('ai.agents.kpi.active')}</p>
        </div>
        <div className="kpi-card">
          <p className="font-display font-bold text-2xl text-muted">{inactive}</p>
          <p className="text-xs text-muted mt-1">{t('ai.agents.kpi.inactive')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={openCreate}>
          {t('ai.agents.new')}
        </Button>
        <div className="flex-1 min-w-[100px]" />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AgentType | 'all')}
          className="px-3 py-2 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
        >
          <option value="all">{t('common.all')}</option>
          {AGENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`ai.agents.types.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <Table columns={columns} rows={filtered} rowKey={(a) => a.id} onRowClick={openEdit} />

      <Modal
        open={!!modalState}
        onClose={() => setModalState(null)}
        title={modalState?.mode === 'edit' ? t('ai.agents.edit') : t('ai.agents.new')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label={t('ai.agents.form.name')}
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">
              {t('ai.agents.form.description')}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('ai.agents.form.type')}</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AgentType }))}
                className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
              >
                {AGENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`ai.agents.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('ai.agents.form.module')}</label>
              <select
                value={form.module}
                onChange={(e) => setForm((f) => ({ ...f, module: e.target.value as AgentModule }))}
                className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
              >
                {AGENT_MODULES.map((module) => (
                  <option key={module} value={module}>
                    {t(`ai.agents.modules.${module}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setModalState(null)}>
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
        title={t('ai.agents.delete')}
        message={t('ai.agents.deleteConfirm', { name: confirmDelete?.name ?? '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
