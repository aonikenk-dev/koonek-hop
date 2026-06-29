import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { fetchHealthBackgroundByPatientId } from '@/services/healthBackground';
import {
  PATHOLOGICAL_KEYS,
  NON_PATHOLOGICAL_KEYS,
  HEREDITARY_KEYS,
  type BoolText,
  type HealthBackground,
  type PathologicalKey,
  type NonPathologicalKey,
  type HereditaryKey,
} from '@/data/mock/healthBackground';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';

interface BackgroundTabProps {
  patientId: string;
  value: HealthBackground | null;
  onChange: (value: HealthBackground) => void;
}

function BoolTextRow({ label, value, onChange }: { label: string; value: BoolText; onChange: (v: BoolText) => void }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-border last:border-b-0">
      <Toggle checked={value.checked} onChange={(checked) => onChange({ ...value, checked })} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text">{label}</p>
        {value.checked && (
          <input
            value={value.text}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
            placeholder="Detalle..."
            className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-surface font-mono text-xs text-text outline-none focus:border-moss"
          />
        )}
      </div>
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  addLabel,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  addLabel: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    if (!draft.trim()) return;
    onChange([...tags, draft.trim()]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="badge-glacier text-xs">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))} className="ml-1.5">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1 px-3 py-2 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
        />
        <Button type="button" variant="secondary" className="text-xs" onClick={add}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

export default function BackgroundTab({ patientId, value, onChange }: BackgroundTabProps) {
  const { t } = useApp();

  const { data } = useQuery({
    queryKey: ['healthBackground', patientId],
    queryFn: () => fetchHealthBackgroundByPatientId(patientId),
  });

  useEffect(() => {
    if (!value && data) onChange(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, data]);

  if (!value) return <p className="text-sm text-muted">{t('common.loading')}</p>;

  const setPathological = (key: PathologicalKey, v: BoolText) =>
    onChange({ ...value, pathological: { ...value.pathological, [key]: v } });
  const setNonPathological = (key: NonPathologicalKey, v: BoolText) =>
    onChange({ ...value, nonPathological: { ...value.nonPathological, [key]: v } });
  const setHereditary = (key: HereditaryKey, v: BoolText) =>
    onChange({ ...value, hereditary: { ...value.hereditary, [key]: v } });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('patients.detail.descriptions.background')}</p>

      <Section title={t('patients.detail.background.sections.allergies')}>
        <TagInput tags={value.allergies} onChange={(allergies) => onChange({ ...value, allergies })} addLabel={t('common.new')} />
        <Input
          label={t('patients.detail.background.extraComments')}
          value={value.allergiesExtraComments}
          onChange={(e) => onChange({ ...value, allergiesExtraComments: e.target.value })}
        />
      </Section>

      <Section title={t('patients.detail.background.sections.activeDrugs')}>
        <TagInput tags={value.activeDrugs} onChange={(activeDrugs) => onChange({ ...value, activeDrugs })} addLabel={t('common.new')} />
        <Input
          label={t('patients.detail.background.extraComments')}
          value={value.activeDrugsExtraComments}
          onChange={(e) => onChange({ ...value, activeDrugsExtraComments: e.target.value })}
        />
      </Section>

      <Section title={t('patients.detail.background.sections.pathological')} defaultOpen={false}>
        {PATHOLOGICAL_KEYS.map((key) => (
          <BoolTextRow
            key={key}
            label={t(`patients.detail.background.conditions.${key}`)}
            value={value.pathological[key]}
            onChange={(v) => setPathological(key, v)}
          />
        ))}
        <Input
          label={t('patients.detail.background.others')}
          value={value.pathologicalOthers}
          onChange={(e) => onChange({ ...value, pathologicalOthers: e.target.value })}
        />
      </Section>

      <Section title={t('patients.detail.background.sections.nonPathological')} defaultOpen={false}>
        {NON_PATHOLOGICAL_KEYS.map((key) => (
          <BoolTextRow
            key={key}
            label={t(`patients.detail.background.conditions.${key}`)}
            value={value.nonPathological[key]}
            onChange={(v) => setNonPathological(key, v)}
          />
        ))}
        <Input
          label={t('patients.detail.background.others')}
          value={value.nonPathologicalOthers}
          onChange={(e) => onChange({ ...value, nonPathologicalOthers: e.target.value })}
        />
      </Section>

      <Section title={t('patients.detail.background.sections.hereditary')} defaultOpen={false}>
        {HEREDITARY_KEYS.map((key) => (
          <BoolTextRow
            key={key}
            label={t(`patients.detail.background.conditions.${key}`)}
            value={value.hereditary[key]}
            onChange={(v) => setHereditary(key, v)}
          />
        ))}
        <Input
          label={t('patients.detail.background.others')}
          value={value.hereditaryOthers}
          onChange={(e) => onChange({ ...value, hereditaryOthers: e.target.value })}
        />
      </Section>

      <Section title={t('patients.detail.background.sections.psychiatric')}>
        <textarea
          value={value.psychiatric}
          onChange={(e) => onChange({ ...value, psychiatric: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
        />
      </Section>

      <Section title={t('patients.detail.background.sections.nutritional')}>
        <textarea
          value={value.nutritional}
          onChange={(e) => onChange({ ...value, nutritional: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
        />
      </Section>

      <div className="flex justify-end">
        <Button className="text-xs">{t('common.save')}</Button>
      </div>
    </div>
  );
}
