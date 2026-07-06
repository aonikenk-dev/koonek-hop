import type { PreoccupationalExam, XrayExam } from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';

interface Props {
  exam: PreoccupationalExam;
  onChange: (patch: Partial<PreoccupationalExam>) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-2xs text-muted tracking-widest uppercase font-mono mb-3 pb-1 border-b border-border">
      {children}
    </h3>
  );
}

const RX_FIELDS: { field: keyof Pick<XrayExam, 'thoraxObservations' | 'cervicalObservations' | 'lumbosacralObservations' | 'otherObservations'>; labelKey: string }[] = [
  { field: 'thoraxObservations', labelKey: 'preoccupational.xray.rxThorax' },
  { field: 'cervicalObservations', labelKey: 'preoccupational.xray.rxCervical' },
  { field: 'lumbosacralObservations', labelKey: 'preoccupational.xray.rxLumbosacral' },
  { field: 'otherObservations', labelKey: 'preoccupational.xray.rxOther' },
];

export default function XrayTab({ exam, onChange }: Props) {
  const { t } = useApp();
  const { xrayExam } = exam;

  const patchXray = (patch: Partial<XrayExam>) =>
    onChange({ xrayExam: { ...xrayExam, ...patch } });

  return (
    <div className="space-y-5">
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.xray.sectionTitle')}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RX_FIELDS.map(({ field, labelKey }) => (
            <div key={field} className="space-y-1.5">
              <label className="text-2xs font-mono text-muted uppercase tracking-wide block">
                {t(labelKey)}
              </label>
              <textarea
                value={xrayExam[field]}
                onChange={(e) => patchXray({ [field]: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded text-sm font-mono text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors resize-none"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
