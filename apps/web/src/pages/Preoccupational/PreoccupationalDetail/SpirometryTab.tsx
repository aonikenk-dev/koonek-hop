import type { PreoccupationalExam, SpirometryAntecedents } from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';
import Input from '@/components/ui/Input';
import FileUploader from '@/components/ui/FileUploader';

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

function SubGroupTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ember font-mono mb-2 mt-3">{children}</p>;
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-0.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-ember" />
      <span className="text-sm font-mono text-text">{label}</span>
    </label>
  );
}

export default function SpirometryTab({ exam, onChange }: Props) {
  const { t } = useApp();
  const sp = exam.spirometry;

  const setSP = (patch: Partial<SpirometryAntecedents>) =>
    onChange({ spirometry: { ...sp, ...patch } });

  return (
    <div className="space-y-5">
      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.spirometry.sectionTitle')}</SectionTitle>

        <SubGroupTitle>{t('preoccupational.spirometry.respiratory')}</SubGroupTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 mb-2">
          <CheckField label={t('preoccupational.spirometry.frequentColds')} checked={sp.frequentColds} onChange={(v) => setSP({ frequentColds: v })} />
          <CheckField label={t('preoccupational.spirometry.sinusitis')} checked={sp.sinusitis} onChange={(v) => setSP({ sinusitis: v })} />
          <CheckField label={t('preoccupational.spirometry.prolongedBronchitis')} checked={sp.prolongedBronchitis} onChange={(v) => setSP({ prolongedBronchitis: v })} />
          <CheckField label={t('preoccupational.spirometry.asthma')} checked={sp.asthma} onChange={(v) => setSP({ asthma: v })} />
          <CheckField label={t('preoccupational.spirometry.pneumonia')} checked={sp.pneumonia} onChange={(v) => setSP({ pneumonia: v })} />
          <CheckField label={t('preoccupational.spirometry.tbc')} checked={sp.tbc} onChange={(v) => setSP({ tbc: v })} />
        </div>
        <Input
          label={t('preoccupational.spirometry.otherRespiratory')}
          value={sp.otherRespiratory}
          onChange={(e) => setSP({ otherRespiratory: e.target.value })}
        />

        <SubGroupTitle>{t('preoccupational.spirometry.pleural')}</SubGroupTitle>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <CheckField label={t('preoccupational.spirometry.pleurisy')} checked={sp.pleurisy} onChange={(v) => setSP({ pleurisy: v })} />
          <CheckField label={t('preoccupational.spirometry.pneumothorax')} checked={sp.pneumothorax} onChange={(v) => setSP({ pneumothorax: v })} />
        </div>

        <SubGroupTitle>{t('preoccupational.spirometry.spinal')}</SubGroupTitle>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1">
          <CheckField label={t('preoccupational.spirometry.kyphosis')} checked={sp.kyphosis} onChange={(v) => setSP({ kyphosis: v })} />
          <CheckField label={t('preoccupational.spirometry.scoliosis')} checked={sp.scoliosis} onChange={(v) => setSP({ scoliosis: v })} />
          <CheckField label={t('preoccupational.spirometry.thoracicTrauma')} checked={sp.thoracicTrauma} onChange={(v) => setSP({ thoracicTrauma: v })} />
        </div>

        <SubGroupTitle>{t('preoccupational.spirometry.cardiovascular')}</SubGroupTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 mb-2">
          <CheckField label={t('preoccupational.spirometry.arterialHypertension')} checked={sp.arterialHypertension} onChange={(v) => setSP({ arterialHypertension: v })} />
          <CheckField label={t('preoccupational.spirometry.valvulopathy')} checked={sp.valvulopathy} onChange={(v) => setSP({ valvulopathy: v })} />
          <CheckField label={t('preoccupational.spirometry.coronaryDisease')} checked={sp.coronaryDisease} onChange={(v) => setSP({ coronaryDisease: v })} />
        </div>
        <Input
          label={t('preoccupational.spirometry.otherCardiovascular')}
          value={sp.otherCardiovascular}
          onChange={(e) => setSP({ otherCardiovascular: e.target.value })}
        />

        <SubGroupTitle>{t('preoccupational.spirometry.currentSymptoms')}</SubGroupTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
          <CheckField label={t('preoccupational.spirometry.currentCough')} checked={sp.currentCough} onChange={(v) => setSP({ currentCough: v })} />
          <CheckField label={t('preoccupational.spirometry.currentExpectoration')} checked={sp.currentExpectoration} onChange={(v) => setSP({ currentExpectoration: v })} />
          <CheckField label={t('preoccupational.spirometry.currentDyspnea')} checked={sp.currentDyspnea} onChange={(v) => setSP({ currentDyspnea: v })} />
          <CheckField label={t('preoccupational.spirometry.currentThoracicPain')} checked={sp.currentThoracicPain} onChange={(v) => setSP({ currentThoracicPain: v })} />
        </div>

        <SubGroupTitle>{t('preoccupational.spirometry.workData')}</SubGroupTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Input label={t('preoccupational.spirometry.companyTenure')} value={sp.companyTenure} onChange={(e) => setSP({ companyTenure: e.target.value })} />
          <Input label={t('preoccupational.spirometry.taskDuration')} value={sp.taskDuration} onChange={(e) => setSP({ taskDuration: e.target.value })} />
          <Input label={t('preoccupational.spirometry.sport')} value={sp.sport} onChange={(e) => setSP({ sport: e.target.value })} />
          <Input label={t('preoccupational.spirometry.smokingAmount')} value={sp.smokingAmount} onChange={(e) => setSP({ smokingAmount: e.target.value })} />
          <Input label={t('preoccupational.spirometry.smokingStartAge')} value={sp.smokingStartAge} onChange={(e) => setSP({ smokingStartAge: e.target.value })} />
        </div>
      </section>

      <section className="bg-surface border border-border rounded-md p-4">
        <SectionTitle>{t('preoccupational.spirometry.files')}</SectionTitle>
        <FileUploader
          files={exam.spirometryFiles ?? []}
          onChange={(files) => onChange({ spirometryFiles: files })}
        />
      </section>
    </div>
  );
}
