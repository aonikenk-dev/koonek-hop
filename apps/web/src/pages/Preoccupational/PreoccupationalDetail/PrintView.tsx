import { useState, useEffect } from 'react';
import type { PreoccupationalExam, XrayExam } from '@/data/mock/preoccupational';
import { organization } from '../../../data/config/organization';
import PreoccupationalSignature from './PreoccupationalSignature';

function useImgDataUrl(src: string | null | undefined): { dataUrl: string | null; done: boolean } {
  const [state, setState] = useState<{ dataUrl: string | null; done: boolean }>({ dataUrl: null, done: !src });
  useEffect(() => {
    if (!src) { setState({ dataUrl: null, done: true }); return; }
    const fullSrc = src.startsWith('http') ? src : `${window.location.origin}${src}`;
    fetch(fullSrc)
      .then((r) => r.blob())
      .then((blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .then((dataUrl) => setState({ dataUrl, done: true }))
      .catch(() => setState({ dataUrl: null, done: true }));
  }, [src]);
  return state;
}

interface Props { exam: PreoccupationalExam; onReady?: (ready: boolean) => void; }

const EXAM_TYPE_LABEL: Record<string, string> = {
  preoccupational: 'PRE-OCUPACIONAL',
  periodic: 'PERIÃ“DICO',
  egress: 'EGRESO',
};

const APTITUDE_LABEL: Record<string, string> = {
  apt: 'APTO SIN PREEXISTENCIA',
  aptWithPreexistence: 'APTO CON PREEXISTENCIA',
  transitoryInapt: 'NO APTO TRANSITORIO',
  inapt: 'NO APTO',
  continuesApt: 'CONTINÃšA APTO',
  continuesAptWithRestrictions: 'CONTINÃšA APTO CON RESTRICCIONES',
  requiresPeriodicControl: 'REQUIERE CONTROL PERIÃ“DICO',
  requiresSpecialistConsultation: 'REQUIERE INTERCONSULTA',
};

type FinalExamKey = keyof XrayExam['finalExam'];

const FINAL_EXAM_COLS: FinalExamKey[][] = [
  ['fisico', 'dermatologico', 'osteoarticularMMSS', 'osteoarticularMMII', 'neumonologico', 'neurologico', 'hematologico', 'orl', 'apDigestivo', 'psicologico', 'cardiovascular', 'urologicoNefrologico'],
  ['oftalmologico', 'endocrinologico', 'ginecologico', 'audiometria', 'espirometria', 'laringoscopia', 'rxTx', 'rxCLS', 'rxMunecas', 'ecg', 'laboratorioInespecifico', 'laboratorioToxicologico'],
];

const FINAL_EXAM_LABELS: Record<FinalExamKey, string> = {
  fisico: 'FÃ­sico', dermatologico: 'DermatolÃ³gico', osteoarticularMMSS: 'Osteoarticular MMSS',
  osteoarticularMMII: 'Osteoarticular MMII', neumonologico: 'NeumonolÃ³gico', neurologico: 'NeurolÃ³gicos',
  hematologico: 'HematolÃ³gico', orl: 'ORL', apDigestivo: 'Ap. Digestivo',
  psicologico: 'PsicolÃ³gico/PsiquiÃ¡trico', cardiovascular: 'Cardiovascular',
  urologicoNefrologico: 'UrolÃ³gico/NefrolÃ³gico', oftalmologico: 'OftalmolÃ³gico',
  endocrinologico: 'EndocrinolÃ³gico', ginecologico: 'GinecolÃ³gico', audiometria: 'AudiometrÃ­a',
  espirometria: 'EspirometrÃ­a', laringoscopia: 'LaringoscopÃ­a', rxTx: 'RX Tx', rxCLS: 'RX CLS',
  rxMunecas: 'RX MuÃ±ecas', ecg: 'ECG', laboratorioInespecifico: 'Lab. InespecÃ­fico',
  laboratorioToxicologico: 'Lab. ToxicolÃ³gico',
};


function PageHeader({ logoSrc }: { logoSrc?: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4, borderBottom: '1px solid #333', paddingBottom: 8, marginBottom: 18 }}>
      {logoSrc && (
        <img
          src={logoSrc}
          alt={organization.name}
          style={{ width: 220, objectFit: 'contain' }}
        />
      )}
    </div>
  );
}

function PageFooter() {
  return (
    <div style={{ borderTop: '1px solid #333', paddingTop: 6, textAlign: 'center', fontSize: '7.5pt', fontWeight: 400, color: '#555', letterSpacing: 0.2 }}>
      {organization.location?.trim()}
      {organization.cellNumber && <> | <span style={{ fontWeight: 600 }}>Celular:</span> {organization.cellNumber.trim()}</>}
      {organization.contactEmail && <> | {organization.contactEmail.trim()}</>}
    </div>
  );
}

const cb = (v: boolean) => v ? 'â˜‘' : 'â˜';
const d = (v?: string | number | null) =>
  (v !== undefined && v !== null && String(v).trim() !== '') ? String(v) : 'â€”';
const dateStr = (s?: string) => s ? new Date(s).toLocaleDateString('es-AR') : 'â€”';

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 2, fontSize: '9pt' }}>
      <span style={{ fontWeight: 600, minWidth: 180, flexShrink: 0 }}>{label}:</span>
      <span style={{ fontWeight: 400 }}>{value ?? 'â€”'}</span>
    </div>
  );
}

function Check({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 2, fontSize: '9.5pt' }}>
      <span style={{ width: 16, flexShrink: 0 }}>{cb(checked)}</span>
      <span>{label}</span>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #555', paddingBottom: 4, marginTop: 14, marginBottom: 6, fontSize: '9.5pt', letterSpacing: 0.4, color: '#222' }}>
      {children}
    </div>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 600, fontSize: '9pt', marginTop: 8, marginBottom: 3, borderBottom: '1px solid #ccc', paddingBottom: 3, color: '#333' }}>
      {children}
    </div>
  );
}

function YNTable({ rows }: { rows: { label: string; value: boolean; indent?: boolean }[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6, fontSize: '9pt' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '2px 4px', borderBottom: '1px solid #999', width: '65%' }}>CondiciÃ³n</th>
          <th style={{ textAlign: 'center', padding: '2px 4px', borderBottom: '1px solid #999', width: '17.5%' }}>SI</th>
          <th style={{ textAlign: 'center', padding: '2px 4px', borderBottom: '1px solid #999', width: '17.5%' }}>NO</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, value, indent }) => (
          <tr key={label}>
            <td style={{ padding: '1px 4px', paddingLeft: indent ? 20 : 4, borderBottom: '1px solid #eee' }}>{label}</td>
            <td style={{ textAlign: 'center', padding: '1px 4px', borderBottom: '1px solid #eee' }}>{value ? 'â˜‘' : 'â˜'}</td>
            <td style={{ textAlign: 'center', padding: '1px 4px', borderBottom: '1px solid #eee' }}>{!value ? 'â˜‘' : 'â˜'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PrintView({ exam, onReady }: Props) {
  const { patient, result, xrayExam, clinicalExam, spirometry, declaration, habitsDeclaration,
    familyHistory, personalAntecedents } = exam;

  const { dataUrl: logoDataUrl, done: logoDone } = useImgDataUrl(organization.logoForPrintUrl);

  useEffect(() => {
    onReady?.(logoDone);
  }, [logoDone, onReady]);

  const todayStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  const pageStyle: React.CSSProperties = {
    padding: '16mm 20mm 12mm',
    pageBreakAfter: 'always',
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '9pt',
    fontWeight: 400,
    color: '#222',
    lineHeight: 1.55,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <>
      {/* Embedded print styles */}
      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0 !important; }
          .pv-page { page-break-after: always; padding: 12mm 14mm !important; }
          .pv-page:last-child { page-break-after: auto !important; }
        }
        .pv-exam-type { font-size: 20pt; font-weight: bold; text-align: center; letter-spacing: 4px; margin: 24px 0 12px; }
        .pv-exam-type-under { text-decoration: underline; }
      `}</style>

      {/* Standalone header strip â€” captured by handlePrint for sworn declaration attachment pages */}
      <div data-pv-header style={{ padding: '6mm 20mm 3mm', width: '210mm', fontFamily: 'Montserrat, Arial, sans-serif', background: '#fff' }}>
        <PageHeader logoSrc={logoDataUrl} />
      </div>

      {/* â”€â”€â”€ PAGE 1: Cover â”€â”€â”€ */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader logoSrc={logoDataUrl} />
        <div style={{ flexGrow: 1 }}>
          <div style={{ textAlign: 'center', margin: '36px 0 28px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 400, letterSpacing: 1, textTransform: 'uppercase', color: '#222' }}>
              EXAMEN {EXAM_TYPE_LABEL[exam.examType] ?? exam.examType.toUpperCase()} DE SALUD
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: '10pt', marginBottom: 10 }}>
              <span style={{ fontWeight: 600 }}>Sr./Sra.: </span>
              <span style={{ fontWeight: 400, textTransform: 'uppercase' }}>
                {patient.firstName} {patient.lastName}
              </span>
            </div>
            <div style={{ fontSize: '10pt', marginBottom: 10 }}>
              <span style={{ fontWeight: 600 }}>Empresa: </span>
              <span style={{ fontWeight: 400 }}>{exam.company}</span>
            </div>
            {(exam.place || exam.date) && (
              <div style={{ fontSize: '10pt', marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>Fecha y lugar: </span>
                <span style={{ fontWeight: 400 }}>
                  {[
                    exam.place?.trim(),
                    exam.date
                      ? new Date(exam.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : undefined,
                  ].filter(Boolean).join('. ')}
                  {'.'}
                </span>
              </div>
            )}
          </div>
        </div>
        <PageFooter />
      </div>

      {/* â”€â”€â”€ PAGE 2: DeclaraciÃ³n Jurada â”€â”€â”€ */}
      <div className="pv-page" data-pv-page="declaration" style={pageStyle}>
        <PageHeader logoSrc={logoDataUrl} />
        <div style={{ flexGrow: 1 }}>
        <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>
          <div style={{ fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase' }}>Datos y antecedentes del Trabajador</div>
          <div style={{ fontSize: '9pt' }}>ESTOS ANTECEDENTES SON PARA USO CONFIDENCIAL DEL SERVICIO MÃ‰DICO</div>
        </div>
        <div style={{ fontSize: '10pt', marginBottom: 6 }}><strong>EMPRESA:</strong> {exam.company}</div>

        <H2>A) Datos Generales</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <Row label="Apellidos" value={patient.lastName} />
          <Row label="Nombres" value={patient.firstName} />
          <Row label="Fecha Nacimiento" value={dateStr(patient.dateOfBirth)} />
          <Row label="Lugar" value={d(patient.birthPlace)} />
          <Row label="Estado Civil" value={d(patient.maritalStatus)} />
          <Row label="NÂ° de Hijos" value={d(patient.numberOfChildren)} />
          <Row label="Tipo documento" value={patient.nationalIdType} />
          <Row label="Nro" value={d(patient.documentId)} />
          {patient.cuil && <Row label="CUIL" value={patient.cuil} />}
          <Row label="Domicilio" value={d(patient.address)} />
          <Row label="Localidad" value={d(patient.city)} />
          {patient.postalCode && <Row label="CÃ³digo Postal" value={patient.postalCode} />}
          {patient.state && <Row label="Provincia" value={patient.state} />}
          <Row label="PaÃ­s" value={d(patient.country)} />
        </div>

        <H2>B) Datos Laborales</H2>
        <Row label="Puesto" value={d(exam.position)} />
        <Row label="Tareas a realizar" value={d(exam.tasks)} />

        <H2>C) Datos Personales</H2>
        <YNTable rows={[
          { label: 'Â¿Tuvo que abandonar algÃºn empleo por razones de salud?', value: declaration.leftJobForHealth },
          { label: 'Â¿RecibiÃ³ o tiene pendiente una indemnizaciÃ³n por accidente de trabajo o enfermedad profesional?', value: declaration.pendingCompensation },
          { label: 'Â¿Ha sido exceptuado del Servicio Militar?', value: declaration.exemptedFromMilitary },
          { label: 'Â¿Le ha sido negado alguna vez un Seguro de vida?', value: declaration.deniedLifeInsurance },
        ]} />

        <H2>D) HÃ¡bitos</H2>
        <div style={{ display: 'flex', gap: 32, marginBottom: 8 }}>
          <span style={{ fontSize: '9.5pt' }}><strong>Â¿Fuma?</strong> {habitsDeclaration.smokes ? 'â˜‘' : 'â˜'}</span>
          <span style={{ fontSize: '9.5pt' }}><strong>Â¿Bebe?</strong> {habitsDeclaration.drinks ? 'â˜‘' : 'â˜'}</span>
        </div>

        <H2>E) Antecedentes Familiares</H2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 8, fontSize: '9.5pt' }}>
          {[
            { label: 'HTA', v: familyHistory.hta },
            { label: 'Diabetes', v: familyHistory.diabetes },
            { label: 'NeurolÃ³gicas', v: familyHistory.neurological },
            { label: 'NeoplÃ¡sicas', v: familyHistory.neoplastic },
          ].map(({ label, v }) => (
            <span key={label}>{cb(v)} {label}</span>
          ))}
          {familyHistory.other && <span>Otras: {familyHistory.other}</span>}
        </div>
        <H2>F) DeclaraciÃ³n Jurada RES 43/97 SRT LEY 24.557</H2>
        <div style={{ marginTop: 10, fontSize: '8pt', fontStyle: 'italic', fontWeight: 300, borderTop: '1px solid #ccc', paddingTop: 6, color: '#333' }}>
          Declaro que la informaciÃ³n suministrada es completa y verÃ­dica. La falta de cooperaciÃ³n serÃ¡ suficiente para suspender el examen de acuerdo a CÃ³digo Penal Art. 293.
        </div>
        </div>
        <PageFooter />
      </div>

      {/* â”€â”€â”€ PAGE 3: Antecedentes Personales + Examen ClÃ­nico â”€â”€â”€ */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader logoSrc={logoDataUrl} />
        <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: 10 }}>
          <span>Nombres: {patient.firstName}</span>
          <span style={{ marginLeft: 32 }}>Apellidos: {patient.lastName}</span>
          <span style={{ marginLeft: 32 }}>Nro Documento: {patient.documentId}</span>
        </div>

        <H2>Antecedentes Personales</H2>
        <Row label="PatologÃ­a ClÃ­nica/QuirÃºrgica" value={d(personalAntecedents.clinicalSurgicalPathology)} />
        <Row label="Toma medicaciÃ³n permanente" value={personalAntecedents.permanentMedication ? 'SÃ' : 'NO'} />
        {personalAntecedents.permanentMedication && (
          <Row label="Detalle medicaciÃ³n" value={d(personalAntecedents.permanentMedicationDetail)} />
        )}
        <div style={{ display: 'flex', gap: 32, marginBottom: 3, fontSize: '9.5pt' }}>
          <span><strong>Fumador:</strong> {d(personalAntecedents.smokerAmount) || 'â€”'}</span>
          <span><strong>HÃ¡bitos:</strong> {d(personalAntecedents.habits) || 'â€”'}</span>
        </div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 3, fontSize: '9.5pt' }}>
          <span><strong>AlÃ©rgico:</strong> {personalAntecedents.allergic ? 'SÃ' : 'NO'}</span>
          {personalAntecedents.allergic && <span><strong>Tipo:</strong> {d(personalAntecedents.allergicType)}</span>}
        </div>
        <Row label="Enf. Profesionales / Acc. Trabajo / Secuelas" value={d(personalAntecedents.professionalDiseases)} />
        {personalAntecedents.laborIncapacity && (
          <Row label="Incapacidad laboral" value={personalAntecedents.laborIncapacity} />
        )}

        <H2>Examen ClÃ­nico</H2>
        <div style={{ display: 'flex', gap: 32, marginBottom: 6, fontSize: '9.5pt' }}>
          <span><strong>Altura:</strong> {d(clinicalExam.height)} cm</span>
          <span><strong>Peso:</strong> {d(clinicalExam.weight)} Kg</span>
          <span><strong>HÃ¡bito:</strong> {d(clinicalExam.habit)}</span>
          <span><strong>Marcha:</strong> {d(clinicalExam.gait)}</span>
          <span><strong>Estado General:</strong> {d(clinicalExam.generalState)}</span>
        </div>

        <H3>Piel</H3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '9.5pt', marginBottom: 4 }}>
          {[
            { label: 'Normal', v: clinicalExam.skinNormal },
            { label: 'Eccemas', v: clinicalExam.skinEczemas },
            { label: 'Ictericia', v: clinicalExam.skinJaundice },
            { label: 'Dermatitis', v: clinicalExam.skinDermatitis },
            { label: 'Quemaduras', v: clinicalExam.skinBurns },
            { label: 'Cicatrices', v: clinicalExam.skinScars },
          ].map(({ label, v }) => (
            <span key={label}>{label} {cb(v)}</span>
          ))}
        </div>
        {clinicalExam.skinLocation && <div style={{ fontSize: '9pt' }}>UbicaciÃ³n: {clinicalExam.skinLocation}</div>}

        <H3>Ojos â€” VisiÃ³n (Agudeza segÃºn tabla de optotipos)</H3>
        <div style={{ display: 'flex', gap: 24, fontSize: '9.5pt', marginBottom: 4 }}>
          <span>OD VL: {d(clinicalExam.eyeRightNearVision)}</span>
          <span>OD VC: {d(clinicalExam.eyeRightColorVision)}</span>
          <span>OI VL: {d(clinicalExam.eyeLeftNearVision)}</span>
          <span>OI VC: {d(clinicalExam.eyeLeftColorVision)}</span>
        </div>

        <H3>ORL</H3>
        <div style={{ display: 'flex', gap: 24, fontSize: '9.5pt', marginBottom: 4 }}>
          <span>Tabique nasal: {clinicalExam.nasalSeptumNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
          <span>AudiciÃ³n OD: {clinicalExam.hearingRightNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
          <span>AudiciÃ³n OI: {clinicalExam.hearingLeftNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
        </div>

        <H3>Aparato Respiratorio</H3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '9.5pt', marginBottom: 4 }}>
          {[
            { label: 'Enfisema', v: clinicalExam.respiratoryEmphysema },
            { label: 'Asma', v: clinicalExam.respiratoryAsthma },
            { label: 'Disnea', v: clinicalExam.respiratoryDyspnea },
          ].map(({ label, v }) => (
            <span key={label}>{label} {cb(v)}</span>
          ))}
          <span>TÃ³rax: {clinicalExam.respiratoryThoraxNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
          <span>AuscultaciÃ³n: {clinicalExam.respiratoryAuscultationNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
        </div>
        {clinicalExam.respiratoryObservations && <div style={{ fontSize: '9pt' }}>Observaciones: {clinicalExam.respiratoryObservations}</div>}

        <H3>Abdomen</H3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '9.5pt', marginBottom: 4 }}>
          <span>General: {clinicalExam.abdomenNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
          <span>Hepatomegalia {cb(clinicalExam.abdomenHepatomegaly)}</span>
          <span>Esplenomegalia {cb(clinicalExam.abdomenSplenomegaly)}</span>
          <span>Hernias {cb(clinicalExam.abdomenHernias)}{clinicalExam.abdomenHerniaLocation ? ` (${clinicalExam.abdomenHerniaLocation})` : ''}</span>
          <span>Eventraciones {cb(clinicalExam.abdomenEventrations)}</span>
        </div>

        <H3>Aparato Cardiovascular</H3>
        <div style={{ display: 'flex', gap: 24, fontSize: '9.5pt', marginBottom: 4 }}>
          <span>T.A.: {d(clinicalExam.cardiovascularBP)}</span>
          <span>Pulso: {d(clinicalExam.cardiovascularPulse)}</span>
          <span>AuscultaciÃ³n: {clinicalExam.cardiovascularAuscultationNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
          <span>Ritmo CardÃ­aco: {clinicalExam.cardiovascularRhythmNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
        </div>

        <H3>Examen Osteo-Muscular-Articular</H3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: '9.5pt', marginBottom: 4 }}>
          {[
            { label: 'Columna lumbar sacra', v: clinicalExam.musculoLumbarSacralNormal },
            { label: 'Miembros superiores', v: clinicalExam.musculoUpperLimbsNormal },
            { label: 'VÃ¡rices MMII', v: clinicalExam.musculoVaricoseVeinsNormal },
            { label: 'Columna cervical', v: clinicalExam.musculoCervicalNormal },
            { label: 'Miembros inferiores', v: clinicalExam.musculoLowerLimbsNormal },
            { label: 'Columna dorsal', v: clinicalExam.musculoDorsalNormal },
          ].map(({ label, v }) => (
            <span key={label}>{label}: {v ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
          ))}
        </div>

        <H3>Examen NeurolÃ³gico</H3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '9.5pt', marginBottom: 4 }}>
          {[
            { label: 'Epilepsia', v: clinicalExam.neuroEpilepsy },
            { label: 'VÃ©rtigo', v: clinicalExam.neuroVertigo },
            { label: 'Temblores', v: clinicalExam.neuroTremors },
            { label: 'Trast. Marcha', v: clinicalExam.neuroGaitDisorder },
          ].map(({ label, v }) => (
            <span key={label}>{label} {cb(v)}</span>
          ))}
          <span>Reflejos: {clinicalExam.neuroReflexesNormal ? 'â¦¿ Normal' : 'â—‹ PatolÃ³gico'}</span>
        </div>
        {clinicalExam.clinicalObservations && (
          <div style={{ marginTop: 6, fontSize: '9pt' }}>
            <strong>Observaciones:</strong> {clinicalExam.clinicalObservations}
          </div>
        )}
        </div>
        <PageFooter />
      </div>

      {/* â”€â”€â”€ PAGE 4: EspirometrÃ­a â”€â”€â”€ */}
      <div className="pv-page" data-pv-page="spirometry" style={pageStyle}>
        <PageHeader logoSrc={logoDataUrl} />
        <div style={{ flexGrow: 1 }}>
        <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '13pt', marginBottom: 12, textTransform: 'uppercase', fontStyle: 'italic' }}>
          Antecedentes de Valor para la InterpretaciÃ³n de la EspirometrÃ­a
        </div>
        <div style={{ fontSize: '9.5pt', marginBottom: 8 }}>
          <span>Nombres: {patient.firstName}&nbsp;&nbsp;&nbsp;Apellidos: {patient.lastName}</span>
          <span style={{ marginLeft: 20 }}>Empresa: {exam.company}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <H3>Afecciones Respiratorias</H3>
            <YNTable rows={[
              { label: 'ResfrÃ­os frecuentes', value: spirometry.frequentColds },
              { label: 'Sinusitis', value: spirometry.sinusitis },
              { label: 'Bronquitis prolongada', value: spirometry.prolongedBronchitis },
              { label: 'Asma', value: spirometry.asthma },
              { label: 'NeumonÃ­a', value: spirometry.pneumonia },
              { label: 'TBC', value: spirometry.tbc },
            ]} />
            {spirometry.otherRespiratory && <div style={{ fontSize: '9pt' }}>Otras: {spirometry.otherRespiratory}</div>}

            <H3>Afecciones Pleurales</H3>
            <YNTable rows={[
              { label: 'Pleuresia', value: spirometry.pleurisy },
              { label: 'NeumotÃ³rax', value: spirometry.pneumothorax },
            ]} />

            <H3>Tiene Actualmente</H3>
            <YNTable rows={[
              { label: 'Tos', value: spirometry.currentCough },
              { label: 'Expectoraciones', value: spirometry.currentExpectoration },
              { label: 'Disnea', value: spirometry.currentDyspnea },
              { label: 'Dolor torÃ¡cico', value: spirometry.currentThoracicPain },
            ]} />
          </div>

          <div>
            <H3>Deformaciones TorÃ¡cicas</H3>
            <YNTable rows={[
              { label: 'Cifosis', value: spirometry.kyphosis },
              { label: 'Escoliosis', value: spirometry.scoliosis },
            ]} />

            <H3>Traumatismo de TÃ³rax</H3>
            <YNTable rows={[
              { label: 'Traumatismo', value: spirometry.thoracicTrauma },
            ]} />

            <H3>Afecciones Cardiovasculares</H3>
            <YNTable rows={[
              { label: 'HipertensiÃ³n arterial', value: spirometry.arterialHypertension },
              { label: 'ValvulopatÃ­as', value: spirometry.valvulopathy },
              { label: 'CoronariopatÃ­as', value: spirometry.coronaryDisease },
            ]} />
            {spirometry.otherCardiovascular && <div style={{ fontSize: '9pt' }}>Otras: {spirometry.otherCardiovascular}</div>}
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: '9.5pt' }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <span><strong>AntigÃ¼edad en la empresa:</strong> {d(spirometry.companyTenure)}</span>
            <span><strong>Â¿CuÃ¡nto tiempo trabaja en la tarea?:</strong> {d(spirometry.taskDuration)}</span>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 4 }}>
            <span><strong>Deporte:</strong> {d(spirometry.sport)}</span>
          </div>
        </div>

        {(spirometry.smokingAmount || spirometry.smokingStartAge) && (
          <div style={{ marginTop: 10 }}>
            <H3>Tabaquismo</H3>
            <div style={{ display: 'flex', gap: 32, fontSize: '9pt' }}>
              {spirometry.smokingAmount && <span><strong>Cantidad cigarrillos:</strong> {spirometry.smokingAmount}</span>}
              {spirometry.smokingStartAge && <span><strong>Edad inicio fumador:</strong> {spirometry.smokingStartAge}</span>}
            </div>
          </div>
        )}
        </div>
        <PageFooter />
      </div>

      {/* â”€â”€â”€ PAGE 5: Examen RadiogrÃ¡fico + Examen Final â”€â”€â”€ */}
      <div className="pv-page" data-pv-page="xray" style={pageStyle}>
        <PageHeader logoSrc={logoDataUrl} />
        <div style={{ flexGrow: 1 }}>
        <div style={{ fontSize: '9.5pt', marginBottom: 10 }}>
          <span>Nombres: {patient.firstName}</span>
          <span style={{ marginLeft: 32 }}>Apellidos: {patient.lastName}</span>
          <span style={{ marginLeft: 32 }}>Documento: {patient.nationalIdType} {patient.documentId}</span>
        </div>

        <H2>Examen RadiogrÃ¡fico</H2>
        {[
          { label: 'RX Torax', value: xrayExam.thoraxObservations },
          { label: 'RX C Cervical (FyP)', value: xrayExam.cervicalObservations },
          { label: 'RX C Lumbosacra (FyP)', value: xrayExam.lumbosacralObservations },
          { label: 'RX Otras', value: xrayExam.otherObservations },
        ].map(({ label, value }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginBottom: 2 }}>{label}:</div>
            <div style={{ fontSize: '9.5pt', minHeight: 20, paddingLeft: 8 }}>{value || <span style={{ color: '#aaa' }}>â€”</span>}</div>
          </div>
        ))}

        <H2>Examen Final</H2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
          <thead>
            <tr>
              {FINAL_EXAM_COLS.map((_, ci) => (
                <>
                  <th key={`h-exam-${ci}`} style={{ textAlign: 'left', padding: '4px 8px', border: '1px solid #999', width: '40%' }}>Examen</th>
                  <th key={`h-n-${ci}`} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid #999', width: '5%' }}>N</th>
                  <th key={`h-p-${ci}`} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid #999', width: '5%' }}>P</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: FINAL_EXAM_COLS[0].length }).map((_, ri) => (
              <tr key={ri}>
                {FINAL_EXAM_COLS.map((col, ci) => {
                  const key = col[ri];
                  if (!key) return <><td key={`e${ci}`} /><td key={`n${ci}`} /><td key={`p${ci}`} /></>;
                  const val = xrayExam.finalExam && xrayExam.finalExam[key];
                  return (
                    <>
                      <td key={`e-${ci}-${ri}`} style={{ padding: '4px 8px', border: '1px solid #ddd' }}>{FINAL_EXAM_LABELS[key]}</td>
                      <td key={`n-${ci}-${ri}`} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid #ddd' }}>{val === 'normal' ? 'â˜‘' : 'â˜'}</td>
                      <td key={`p-${ci}-${ri}`} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid #ddd' }}>{val === 'pathological' ? 'â˜‘' : 'â˜'}</td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <PageFooter />
      </div>

      {/* â”€â”€â”€ PAGE 6: Resultado + ConclusiÃ³n â”€â”€â”€ */}
      <div className="pv-page" data-pv-page="result" style={pageStyle}>
        <PageHeader logoSrc={logoDataUrl} />
        <div style={{ flexGrow: 1 }}>
        <H2>Resultado</H2>
        <div style={{ fontSize: '9pt', border: '1px solid #ccc', padding: '6px 8px', marginBottom: 10, fontStyle: 'italic' }}>
          Resultado examen periÃ³dico de acuerdo a la Ley NÂº 19.587/72 Dto. NÂº 351/79 y Ley NÂº 24.557/95 Dto NÂº 658/96, Resol NÂº 43/97
        </div>

        <YNTable rows={[
          { label: 'NORMAL', value: result.normal },
          { label: 'ENFERMEDADES INCULPABLES', value: result.inculpableDiseases },
          { label: 'ANORMAL', value: result.abnormal },
          { label: 'Valores fuera de referencia', value: result.outOfRangeValues, indent: true },
          { label: 'Alteraciones PreclÃ­nicas', value: result.preclinicalAlterations, indent: true },
          { label: 'Enfermedades Profesionales', value: result.professionalDiseases, indent: true },
        ]} />

        {result.comments && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginBottom: 4 }}>Comentarios:</div>
            <div style={{ fontSize: '9.5pt', paddingLeft: 8 }}>{result.comments}</div>
          </div>
        )}

        <H2>ConclusiÃ³n</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 16 }}>
          <Check label="Conducta expectante mas control" checked={result.conductExpectantControl} />
          <Check label="Medidas de prevenciÃ³n" checked={result.preventionMeasures} />
          <Check label="Suspender exposiciÃ³n mas control" checked={result.suspendExposureControl} />
          <Check label="Tratamiento" checked={result.treatment} />
        </div>

        {result.aptitude && (
          <div style={{ marginBottom: 24, fontSize: '11pt' }}>
            <strong>Aptitud: </strong>
            <span style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: result.aptitude === 'apt' || result.aptitude === 'continuesApt' ? '#2d6a4f' : result.aptitude === 'inapt' ? '#9b1c1c' : '#b05a2a',
            }}>
              {APTITUDE_LABEL[result.aptitude]}
            </span>
          </div>
        )}

        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, textAlign: 'center', fontSize: '9pt' }}>
          <div>
            <div style={{ minHeight: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 0 }}>
              <div style={{ height: 50, width: 75 }}>
                <PreoccupationalSignature />
              </div>
            </div>
            <div style={{ borderBottom: '1px solid #000', marginBottom: 5 }} />
            <div style={{ fontWeight: 400 }}>Firma del MÃ©dico</div>
          </div>
          <div>
            <div style={{ minHeight: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 0 }}>
              {organization.mainDoctorName && (
                <div style={{ fontSize: '9pt', fontWeight: 500, marginBottom: 4 }}>{organization.mainDoctorName}</div>
              )}
            </div>
            <div style={{ borderBottom: '1px solid #000', marginBottom: 5 }} />
            <div style={{ fontWeight: 400 }}>AclaraciÃ³n</div>
          </div>
          <div>
            <div style={{ minHeight: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 0 }}>
              <div style={{ fontSize: '9pt', fontWeight: 400, marginBottom: 4 }}>
                {organization.city}
              </div>
              <div style={{ fontSize: '9pt', fontWeight: 400, marginBottom: 4 }}>
                {todayStr}
              </div>
            </div>
            <div style={{ borderBottom: '1px solid #000', marginBottom: 5 }} />
            <div style={{ fontWeight: 400 }}>Lugar y fecha</div>
          </div>
        </div>
        </div>
        <PageFooter />
      </div>
    </>
  );
}
