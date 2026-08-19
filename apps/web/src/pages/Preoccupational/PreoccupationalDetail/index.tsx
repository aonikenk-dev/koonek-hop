import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { Save, CheckCircle, Printer, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { PreoccupationalExam } from '@/data/mock/preoccupational';
import { getExam, saveExam, completeExam } from '@/services/preoccupational';
import Button from '@/components/ui/Button';
import PrintView from './PrintView';
import SummaryTab from './SummaryTab';
import DeclarationTab from './DeclarationTab';
import ClinicalExamTab from './ClinicalExamTab';
import SpirometryTab from './SpirometryTab';
import XrayTab from './XrayTab';
import ResultTab from './ResultTab';
import AttachmentsTab from './AttachmentsTab';

type TabId = 'summary' | 'declaration' | 'clinicalExam' | 'spirometry' | 'xray' | 'attachments' | 'result';

const TAB_IDS: TabId[] = ['summary', 'declaration', 'clinicalExam', 'spirometry', 'xray', 'attachments', 'result'];

export default function PreoccupationalDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useApp();

  const [exam, setExam] = useState<PreoccupationalExam | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) { setLoadError(true); return; }
    void getExam(id).then(setExam).catch(() => setLoadError(true));
  }, [id]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted font-mono">Examen no encontrado.</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted font-mono">{t('common.loading')}</p>
      </div>
    );
  }

  const patchExam = (patch: Partial<PreoccupationalExam>) => {
    setExam((prev) => prev ? { ...prev, ...patch } : prev);
    setSaved(false);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await saveExam(exam.id, exam);
      setExam(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    const updated = await completeExam(exam.id);
    setExam(updated);
  };

  const handlePrint = async () => {
    if (!printRef.current || isPrinting) return;
    setIsPrinting(true);

    try {
      const [{ default: html2canvas }, { PDFDocument }] = await Promise.all([
        import('html2canvas'),
        import('pdf-lib'),
      ]);

      const pdfDoc = await PDFDocument.create();
      const A4: [number, number] = [595.28, 841.89];

      // Temporarily reveal the container for html2canvas — it stays off-screen (left: -9999px).
      const container = printRef.current!;
      container.style.visibility = 'visible';
      try {
        const pageEls = Array.from(container.querySelectorAll<HTMLElement>('.pv-page'));
        for (const pageEl of pageEls) {
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          });
          const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
          const imgBytes = await fetch(jpegUrl).then((r) => r.arrayBuffer());
          const img = await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage(A4);
          const scale = Math.min(A4[0] / img.width, A4[1] / img.height);
          page.drawImage(img, {
            x: (A4[0] - img.width * scale) / 2,
            y: (A4[1] - img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
          });
        }
      } finally {
        container.style.visibility = 'hidden';
      }

      // Merge each attachment file into the PDF
      for (const att of exam.attachments) {
        for (const file of att.files) {
          const ext = (file.name.split('.').pop() ?? '').toLowerCase();
          try {
            const fileBytes = await fetch(file.url).then((r) => r.arrayBuffer());
            if (ext === 'pdf') {
              const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
              const copied = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
              copied.forEach((p) => pdfDoc.addPage(p));
            } else if (ext === 'jpg' || ext === 'jpeg') {
              const img = await pdfDoc.embedJpg(fileBytes);
              const page = pdfDoc.addPage(A4);
              const margin = 20;
              const scale = Math.min((A4[0] - margin * 2) / img.width, (A4[1] - margin * 2) / img.height);
              page.drawImage(img, {
                x: (A4[0] - img.width * scale) / 2,
                y: (A4[1] - img.height * scale) / 2,
                width: img.width * scale,
                height: img.height * scale,
              });
            } else if (ext === 'png') {
              const img = await pdfDoc.embedPng(fileBytes);
              const page = pdfDoc.addPage(A4);
              const margin = 20;
              const scale = Math.min((A4[0] - margin * 2) / img.width, (A4[1] - margin * 2) / img.height);
              page.drawImage(img, {
                x: (A4[0] - img.width * scale) / 2,
                y: (A4[1] - img.height * scale) / 2,
                width: img.width * scale,
                height: img.height * scale,
              });
            }
          } catch {
            // Skip files that can't be processed
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (win) {
        win.addEventListener('load', () => setTimeout(() => win.print(), 500));
      }
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-text">
            {exam.patient.firstName} {exam.patient.lastName}
          </h2>
          <p className="text-xs text-muted font-mono mt-0.5">
            {exam.patient.nationalIdType} {exam.patient.documentId} · {t(`preoccupational.examTypes.${exam.examType}`)} · {exam.company}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={exam.status === 'completed' ? 'badge-moss' : 'badge-muted'}>
            {t(`preoccupational.status.${exam.status}`)}
          </span>
          <Button leftIcon={isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} variant="secondary" onClick={() => { void handleSave(); }} disabled={isSaving}>
            {saved ? '✓ Guardado' : t('common.save')}
          </Button>
          {exam.status === 'draft' && (
            <Button leftIcon={<CheckCircle size={14} />} onClick={() => { void handleComplete(); }}>
              {t('preoccupational.markComplete')}
            </Button>
          )}
          {exam.status === 'completed' && (
            <Button
              leftIcon={isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              onClick={() => { void handlePrint(); }}
              disabled={isPrinting}
            >
              {isPrinting ? 'Generando PDF...' : t('preoccupational.print')}
            </Button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TAB_IDS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2.5 text-sm font-mono whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'text-ember border-ember'
                : 'text-muted border-transparent hover:text-text hover:border-border'
            )}
          >
            {t(`preoccupational.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Hidden print view — rendered off-screen so innerHTML is complete */}
      <div
        ref={printRef}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', visibility: 'hidden', pointerEvents: 'none' }}
      >
        <PrintView exam={exam} />
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'summary' && (
          <SummaryTab exam={exam} />
        )}
        {activeTab === 'declaration' && (
          <DeclarationTab exam={exam} onChange={patchExam} />
        )}
        {activeTab === 'clinicalExam' && (
          <ClinicalExamTab exam={exam} onChange={patchExam} />
        )}
        {activeTab === 'spirometry' && (
          <SpirometryTab exam={exam} onChange={patchExam} />
        )}
        {activeTab === 'xray' && (
          <XrayTab exam={exam} onChange={patchExam} />
        )}
        {activeTab === 'attachments' && (
          <AttachmentsTab exam={exam} onChange={patchExam} />
        )}
        {activeTab === 'result' && (
          <ResultTab exam={exam} onChange={patchExam} />
        )}
      </div>
    </div>
  );
}
