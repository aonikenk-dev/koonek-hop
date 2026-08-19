import type { PreoccupationalExam, XrayExam } from '@/data/mock/preoccupational';
import { organization } from '../../../data/config/organization';

interface Props { exam: PreoccupationalExam }

const EXAM_TYPE_LABEL: Record<string, string> = {
  preoccupational: 'PRE-OCUPACIONAL',
  periodic: 'PERIÓDICO',
  egress: 'EGRESO',
};

const APTITUDE_LABEL: Record<string, string> = {
  apt: 'APTO SIN PREEXISTENCIA',
  aptWithPreexistence: 'APTO CON PREEXISTENCIA',
  transitoryInapt: 'NO APTO TRANSITORIO',
  inapt: 'NO APTO',
  continuesApt: 'CONTINÚA APTO',
  continuesAptWithRestrictions: 'CONTINÚA APTO CON RESTRICCIONES',
  requiresPeriodicControl: 'REQUIERE CONTROL PERIÓDICO',
  requiresSpecialistConsultation: 'REQUIERE INTERCONSULTA',
};

type FinalExamKey = keyof XrayExam['finalExam'];

const FINAL_EXAM_COLS: FinalExamKey[][] = [
  ['fisico', 'dermatologico', 'osteoarticularMMSS', 'osteoarticularMMII', 'neumonologico', 'neurologico', 'hematologico', 'orl', 'apDigestivo', 'psicologico', 'cardiovascular', 'urologicoNefrologico'],
  ['oftalmologico', 'endocrinologico', 'ginecologico', 'audiometria', 'espirometria', 'laringoscopia', 'rxTx', 'rxCLS', 'rxMunecas', 'ecg', 'laboratorioInespecifico', 'laboratorioToxicologico'],
];

const FINAL_EXAM_LABELS: Record<FinalExamKey, string> = {
  fisico: 'Físico', dermatologico: 'Dermatológico', osteoarticularMMSS: 'Osteoarticular MMSS',
  osteoarticularMMII: 'Osteoarticular MMII', neumonologico: 'Neumonológico', neurologico: 'Neurológicos',
  hematologico: 'Hematológico', orl: 'ORL', apDigestivo: 'Ap. Digestivo',
  psicologico: 'Psicológico/Psiquiátrico', cardiovascular: 'Cardiovascular',
  urologicoNefrologico: 'Urológico/Nefrológico', oftalmologico: 'Oftalmológico',
  endocrinologico: 'Endocrinológico', ginecologico: 'Ginecológico', audiometria: 'Audiometría',
  espirometria: 'Espirometría', laringoscopia: 'Laringoscopía', rxTx: 'RX Tx', rxCLS: 'RX CLS',
  rxMunecas: 'RX Muñecas', ecg: 'ECG', laboratorioInespecifico: 'Lab. Inespecífico',
  laboratorioToxicologico: 'Lab. Toxicológico',
};

const ATTACHMENT_CATEGORY_LABELS: Record<string, string> = {
  spirometry: 'Espirometría', ecg: 'ECG', xray: 'Radiografía', audiometry: 'Audiometría',
  drugTest: 'Test de drogas', lab: 'Laboratorio', psycho: 'Psicotécnico', eeg: 'EEG', other: 'Otro',
};

function PageHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 16 }}>
      {organization.logoForPrintUrl && (
        <img
          src={`${window.location.origin}${organization.logoForPrintUrl}`}
          alt={organization.name}
          crossOrigin="anonymous"
          style={{ width: 250, objectFit: 'contain' }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* <div style={{ fontSize: '15pt', fontWeight: 'bold', fontStyle: 'italic' }}>{organization.name}</div>
        <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>{organization.specialty}</div> */}
        <div style={{ fontSize: '9pt' }}>{organization.location}</div>
      </div>
    </div>
  );
}

const cb = (v: boolean) => v ? '☑' : '☐';
const d = (v?: string | number | null) =>
  (v !== undefined && v !== null && String(v).trim() !== '') ? String(v) : '—';
const dateStr = (s?: string) => s ? new Date(s).toLocaleDateString('es-AR') : '—';

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 2, fontSize: '9.5pt' }}>
      <span style={{ fontWeight: 'bold', minWidth: 180, flexShrink: 0 }}>{label}:</span>
      <span>{value ?? '—'}</span>
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
    <div style={{ fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: 5, marginTop: 14, marginBottom: 6, fontSize: '10pt' }}>
      {children}
    </div>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: 8, marginBottom: 4, borderBottom: '1px solid #000', paddingBottom: 4 }}>
      {children}
    </div>
  );
}

function YNTable({ rows }: { rows: { label: string; value: boolean; indent?: boolean }[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6, fontSize: '9pt' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '2px 4px', borderBottom: '1px solid #999', width: '65%' }}>Condición</th>
          <th style={{ textAlign: 'center', padding: '2px 4px', borderBottom: '1px solid #999', width: '17.5%' }}>SI</th>
          <th style={{ textAlign: 'center', padding: '2px 4px', borderBottom: '1px solid #999', width: '17.5%' }}>NO</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, value, indent }) => (
          <tr key={label}>
            <td style={{ padding: '1px 4px', paddingLeft: indent ? 20 : 4, borderBottom: '1px solid #eee' }}>{label}</td>
            <td style={{ textAlign: 'center', padding: '1px 4px', borderBottom: '1px solid #eee' }}>{value ? '☑' : '☐'}</td>
            <td style={{ textAlign: 'center', padding: '1px 4px', borderBottom: '1px solid #eee' }}>{!value ? '☑' : '☐'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PrintView({ exam }: Props) {
  const { patient, result, xrayExam, clinicalExam, spirometry, declaration, habitsDeclaration,
    familyHistory, personalAntecedents, attachments } = exam;

  const pageStyle: React.CSSProperties = {
    padding: '18mm 20mm',
    pageBreakAfter: 'always',
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: '10pt',
    color: '#000',
    lineHeight: 1.45,
    boxSizing: 'border-box',
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

      {/* Standalone header strip — captured by handlePrint for attachment pages */}
      <div data-pv-header style={{ padding: '8mm 20mm 4mm', width: '210mm', fontFamily: 'Montserrat, Arial, sans-serif', background: '#fff' }}>
        <PageHeader />
      </div>

      {/* ─── PAGE 1: Cover ─── */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader />

        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <div style={{ fontSize: '22pt', fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', letterSpacing: 2 }}>
            EXAMEN&nbsp;&nbsp;{EXAM_TYPE_LABEL[exam.examType] ?? exam.examType.toUpperCase()}&nbsp;&nbsp;DE SALUD
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: '12pt', marginBottom: 12 }}>
            <span style={{ fontWeight: 'bold' }}>Sr./Sra.&nbsp;&nbsp;</span>
            <span style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {patient.firstName}&nbsp;&nbsp;&nbsp;{patient.lastName}
            </span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: 4 }}>Empresa:</div>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{exam.company}</div>
          </div>
          {exam.place && (
            <div style={{ marginTop: 40, fontSize: '10pt' }}>
              <span>{exam.place}</span>
              <span style={{ marginLeft: 24 }}>
                {new Date(exam.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── PAGE 2: Declaración Jurada ─── */}
      <div className="pv-page" data-pv-page="declaration" style={pageStyle}>
        <PageHeader />
        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 8 }}>
          <div style={{ fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase' }}>Datos y antecedentes del Trabajador</div>
          <div style={{ fontSize: '9pt' }}>ESTOS ANTECEDENTES SON PARA USO CONFIDENCIAL DEL SERVICIO MÉDICO</div>
        </div>
        <div style={{ fontSize: '10pt', marginBottom: 6 }}><strong>EMPRESA:</strong> {exam.company}</div>

        <H2>A) Datos Generales</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <Row label="Apellidos" value={patient.lastName} />
          <Row label="Nombres" value={patient.firstName} />
          <Row label="Fecha Nacimiento" value={dateStr(patient.dateOfBirth)} />
          <Row label="Lugar" value={d(patient.birthPlace)} />
          <Row label="Estado Civil" value={d(patient.maritalStatus)} />
          <Row label="N° de Hijos" value={d(patient.numberOfChildren)} />
          <Row label="Tipo documento" value={patient.nationalIdType} />
          <Row label="Nro" value={d(patient.documentId)} />
          {patient.cuil && <Row label="CUIL" value={patient.cuil} />}
          <Row label="Domicilio" value={d(patient.address)} />
          <Row label="Localidad" value={d(patient.city)} />
          {patient.postalCode && <Row label="Código Postal" value={patient.postalCode} />}
          {patient.state && <Row label="Provincia" value={patient.state} />}
          <Row label="País" value={d(patient.country)} />
        </div>

        <H2>B) Datos Laborales</H2>
        <Row label="Puesto" value={d(exam.position)} />
        <Row label="Tareas a realizar" value={d(exam.tasks)} />

        <H2>C) Datos Personales</H2>
        <YNTable rows={[
          { label: '¿Tuvo que abandonar algún empleo por razones de salud?', value: declaration.leftJobForHealth },
          { label: '¿Recibió o tiene pendiente una indemnización por accidente de trabajo o enfermedad profesional?', value: declaration.pendingCompensation },
          { label: '¿Ha sido exceptuado del Servicio Militar?', value: declaration.exemptedFromMilitary },
          { label: '¿Le ha sido negado alguna vez un Seguro de vida?', value: declaration.deniedLifeInsurance },
        ]} />

        <H2>D) Hábitos</H2>
        <div style={{ display: 'flex', gap: 32, marginBottom: 8 }}>
          <span style={{ fontSize: '9.5pt' }}><strong>¿Fuma?</strong> {habitsDeclaration.smokes ? '☑' : '☐'}</span>
          <span style={{ fontSize: '9.5pt' }}><strong>¿Bebe?</strong> {habitsDeclaration.drinks ? '☑' : '☐'}</span>
        </div>

        <H2>E) Antecedentes Familiares</H2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 8, fontSize: '9.5pt' }}>
          {[
            { label: 'HTA', v: familyHistory.hta },
            { label: 'Diabetes', v: familyHistory.diabetes },
            { label: 'Neurológicas', v: familyHistory.neurological },
            { label: 'Neoplásicas', v: familyHistory.neoplastic },
          ].map(({ label, v }) => (
            <span key={label}>{cb(v)} {label}</span>
          ))}
          {familyHistory.other && <span>Otras: {familyHistory.other}</span>}
        </div>
        <H2>F) Declaración Jurada RES 43/97 SRT LEY 24.557</H2>
        <div style={{ marginTop: 10, fontSize: '8.5pt', fontStyle: 'italic', borderTop: '1px solid #ccc', paddingTop: 6 }}>
          Declaro que la información suministrada es completa y verídica. La falta de cooperación será suficiente para suspender el examen de acuerdo a Código Penal Art. 293.
        </div>
      </div>

      {/* ─── PAGE 3: Antecedentes Personales + Examen Clínico ─── */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader />
        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: 10 }}>
          <span>Nombres: {patient.firstName}</span>
          <span style={{ marginLeft: 32 }}>Apellidos: {patient.lastName}</span>
          <span style={{ marginLeft: 32 }}>Nro Documento: {patient.documentId}</span>
        </div>

        <H2>Antecedentes Personales</H2>
        <Row label="Patología Clínica/Quirúrgica" value={d(personalAntecedents.clinicalSurgicalPathology)} />
        <Row label="Toma medicación permanente" value={personalAntecedents.permanentMedication ? 'SÍ' : 'NO'} />
        {personalAntecedents.permanentMedication && (
          <Row label="Detalle medicación" value={d(personalAntecedents.permanentMedicationDetail)} />
        )}
        <div style={{ display: 'flex', gap: 32, marginBottom: 3, fontSize: '9.5pt' }}>
          <span><strong>Fumador:</strong> {d(personalAntecedents.smokerAmount) || '—'}</span>
          <span><strong>Hábitos:</strong> {d(personalAntecedents.habits) || '—'}</span>
        </div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 3, fontSize: '9.5pt' }}>
          <span><strong>Alérgico:</strong> {personalAntecedents.allergic ? 'SÍ' : 'NO'}</span>
          {personalAntecedents.allergic && <span><strong>Tipo:</strong> {d(personalAntecedents.allergicType)}</span>}
        </div>
        <Row label="Enf. Profesionales / Acc. Trabajo / Secuelas" value={d(personalAntecedents.professionalDiseases)} />
        {personalAntecedents.laborIncapacity && (
          <Row label="Incapacidad laboral" value={personalAntecedents.laborIncapacity} />
        )}

        <H2>Examen Clínico</H2>
        <div style={{ display: 'flex', gap: 32, marginBottom: 6, fontSize: '9.5pt' }}>
          <span><strong>Altura:</strong> {d(clinicalExam.height)} cm</span>
          <span><strong>Peso:</strong> {d(clinicalExam.weight)} Kg</span>
          <span><strong>Hábito:</strong> {d(clinicalExam.habit)}</span>
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
        {clinicalExam.skinLocation && <div style={{ fontSize: '9pt' }}>Ubicación: {clinicalExam.skinLocation}</div>}

        <H3>Ojos — Visión (Agudeza según tabla de optotipos)</H3>
        <div style={{ display: 'flex', gap: 24, fontSize: '9.5pt', marginBottom: 4 }}>
          <span>OD VL: {d(clinicalExam.eyeRightNearVision)}</span>
          <span>OD VC: {d(clinicalExam.eyeRightColorVision)}</span>
          <span>OI VL: {d(clinicalExam.eyeLeftNearVision)}</span>
          <span>OI VC: {d(clinicalExam.eyeLeftColorVision)}</span>
        </div>

        <H3>ORL</H3>
        <div style={{ display: 'flex', gap: 24, fontSize: '9.5pt', marginBottom: 4 }}>
          <span>Tabique nasal: {clinicalExam.nasalSeptumNormal ? '⦿ Normal' : '○ Patológico'}</span>
          <span>Audición OD: {clinicalExam.hearingRightNormal ? '⦿ Normal' : '○ Patológico'}</span>
          <span>Audición OI: {clinicalExam.hearingLeftNormal ? '⦿ Normal' : '○ Patológico'}</span>
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
          <span>Tórax: {clinicalExam.respiratoryThoraxNormal ? '⦿ Normal' : '○ Patológico'}</span>
          <span>Auscultación: {clinicalExam.respiratoryAuscultationNormal ? '⦿ Normal' : '○ Patológico'}</span>
        </div>
        {clinicalExam.respiratoryObservations && <div style={{ fontSize: '9pt' }}>Observaciones: {clinicalExam.respiratoryObservations}</div>}

        <H3>Abdomen</H3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '9.5pt', marginBottom: 4 }}>
          <span>General: {clinicalExam.abdomenNormal ? '⦿ Normal' : '○ Patológico'}</span>
          <span>Hepatomegalia {cb(clinicalExam.abdomenHepatomegaly)}</span>
          <span>Esplenomegalia {cb(clinicalExam.abdomenSplenomegaly)}</span>
          <span>Hernias {cb(clinicalExam.abdomenHernias)}{clinicalExam.abdomenHerniaLocation ? ` (${clinicalExam.abdomenHerniaLocation})` : ''}</span>
          <span>Eventraciones {cb(clinicalExam.abdomenEventrations)}</span>
        </div>

        <H3>Aparato Cardiovascular</H3>
        <div style={{ display: 'flex', gap: 24, fontSize: '9.5pt', marginBottom: 4 }}>
          <span>T.A.: {d(clinicalExam.cardiovascularBP)}</span>
          <span>Pulso: {d(clinicalExam.cardiovascularPulse)}</span>
          <span>Auscultación: {clinicalExam.cardiovascularAuscultationNormal ? '⦿ Normal' : '○ Patológico'}</span>
          <span>Ritmo Cardíaco: {clinicalExam.cardiovascularRhythmNormal ? '⦿ Normal' : '○ Patológico'}</span>
        </div>

        <H3>Examen Osteo-Muscular-Articular</H3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: '9.5pt', marginBottom: 4 }}>
          {[
            { label: 'Columna lumbar sacra', v: clinicalExam.musculoLumbarSacralNormal },
            { label: 'Miembros superiores', v: clinicalExam.musculoUpperLimbsNormal },
            { label: 'Várices MMII', v: clinicalExam.musculoVaricoseVeinsNormal },
            { label: 'Columna cervical', v: clinicalExam.musculoCervicalNormal },
            { label: 'Miembros inferiores', v: clinicalExam.musculoLowerLimbsNormal },
            { label: 'Columna dorsal', v: clinicalExam.musculoDorsalNormal },
          ].map(({ label, v }) => (
            <span key={label}>{label}: {v ? '⦿ Normal' : '○ Patológico'}</span>
          ))}
        </div>

        <H3>Examen Neurológico</H3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '9.5pt', marginBottom: 4 }}>
          {[
            { label: 'Epilepsia', v: clinicalExam.neuroEpilepsy },
            { label: 'Vértigo', v: clinicalExam.neuroVertigo },
            { label: 'Temblores', v: clinicalExam.neuroTremors },
            { label: 'Trast. Marcha', v: clinicalExam.neuroGaitDisorder },
          ].map(({ label, v }) => (
            <span key={label}>{label} {cb(v)}</span>
          ))}
          <span>Reflejos: {clinicalExam.neuroReflexesNormal ? '⦿ Normal' : '○ Patológico'}</span>
        </div>
        {clinicalExam.clinicalObservations && (
          <div style={{ marginTop: 6, fontSize: '9.5pt' }}>
            <strong>Observaciones:</strong> {clinicalExam.clinicalObservations}
          </div>
        )}
      </div>

      {/* ─── PAGE 4: Espirometría ─── */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader />
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', marginBottom: 12, textTransform: 'uppercase', fontStyle: 'italic' }}>
          Antecedentes de Valor para la Interpretación de la Espirometría
        </div>
        <div style={{ fontSize: '9.5pt', marginBottom: 8 }}>
          <span>Nombres: {patient.firstName}&nbsp;&nbsp;&nbsp;Apellidos: {patient.lastName}</span>
          <span style={{ marginLeft: 20 }}>Empresa: {exam.company}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <H3>Afecciones Respiratorias</H3>
            <YNTable rows={[
              { label: 'Resfríos frecuentes', value: spirometry.frequentColds },
              { label: 'Sinusitis', value: spirometry.sinusitis },
              { label: 'Bronquitis prolongada', value: spirometry.prolongedBronchitis },
              { label: 'Asma', value: spirometry.asthma },
              { label: 'Neumonía', value: spirometry.pneumonia },
              { label: 'TBC', value: spirometry.tbc },
            ]} />
            {spirometry.otherRespiratory && <div style={{ fontSize: '9pt' }}>Otras: {spirometry.otherRespiratory}</div>}

            <H3>Afecciones Pleurales</H3>
            <YNTable rows={[
              { label: 'Pleuresia', value: spirometry.pleurisy },
              { label: 'Neumotórax', value: spirometry.pneumothorax },
            ]} />

            <H3>Tiene Actualmente</H3>
            <YNTable rows={[
              { label: 'Tos', value: spirometry.currentCough },
              { label: 'Expectoraciones', value: spirometry.currentExpectoration },
              { label: 'Disnea', value: spirometry.currentDyspnea },
              { label: 'Dolor torácico', value: spirometry.currentThoracicPain },
            ]} />
          </div>

          <div>
            <H3>Deformaciones Torácicas</H3>
            <YNTable rows={[
              { label: 'Cifosis', value: spirometry.kyphosis },
              { label: 'Escoliosis', value: spirometry.scoliosis },
            ]} />

            <H3>Traumatismo de Tórax</H3>
            <YNTable rows={[
              { label: 'Traumatismo', value: spirometry.thoracicTrauma },
            ]} />

            <H3>Afecciones Cardiovasculares</H3>
            <YNTable rows={[
              { label: 'Hipertensión arterial', value: spirometry.arterialHypertension },
              { label: 'Valvulopatías', value: spirometry.valvulopathy },
              { label: 'Coronariopatías', value: spirometry.coronaryDisease },
            ]} />
            {spirometry.otherCardiovascular && <div style={{ fontSize: '9pt' }}>Otras: {spirometry.otherCardiovascular}</div>}
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: '9.5pt' }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <span><strong>Antigüedad en la empresa:</strong> {d(spirometry.companyTenure)}</span>
            <span><strong>¿Cuánto tiempo trabaja en la tarea?:</strong> {d(spirometry.taskDuration)}</span>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 4 }}>
            <span><strong>Deporte:</strong> {d(spirometry.sport)}</span>
          </div>
        </div>

        {(spirometry.smokingAmount || spirometry.smokingStartAge) && (
          <div style={{ marginTop: 10 }}>
            <H3>Tabaquismo</H3>
            <div style={{ display: 'flex', gap: 32, fontSize: '9.5pt' }}>
              {spirometry.smokingAmount && <span><strong>Cantidad cigarrillos:</strong> {spirometry.smokingAmount}</span>}
              {spirometry.smokingStartAge && <span><strong>Edad inicio fumador:</strong> {spirometry.smokingStartAge}</span>}
            </div>
          </div>
        )}
      </div>

      {/* ─── PAGE 5: Examen Radiográfico + Examen Final ─── */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader />
        <div style={{ fontSize: '9.5pt', marginBottom: 10 }}>
          <span>Nombres: {patient.firstName}</span>
          <span style={{ marginLeft: 32 }}>Apellidos: {patient.lastName}</span>
          <span style={{ marginLeft: 32 }}>Documento: {patient.nationalIdType} {patient.documentId}</span>
        </div>

        <H2>Examen Radiográfico</H2>
        {[
          { label: 'RX Torax', value: xrayExam.thoraxObservations },
          { label: 'RX C Cervical (FyP)', value: xrayExam.cervicalObservations },
          { label: 'RX C Lumbosacra (FyP)', value: xrayExam.lumbosacralObservations },
          { label: 'RX Otras', value: xrayExam.otherObservations },
        ].map(({ label, value }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginBottom: 2 }}>{label}:</div>
            <div style={{ fontSize: '9.5pt', minHeight: 20, paddingLeft: 8 }}>{value || <span style={{ color: '#aaa' }}>—</span>}</div>
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
                      <td key={`n-${ci}-${ri}`} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid #ddd' }}>{val === 'normal' ? '☑' : '☐'}</td>
                      <td key={`p-${ci}-${ri}`} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid #ddd' }}>{val === 'pathological' ? '☑' : '☐'}</td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── PAGE 6: Resultado + Conclusión ─── */}
      <div className="pv-page" style={pageStyle}>
        <PageHeader />
        <H2>Resultado</H2>
        <div style={{ fontSize: '9pt', border: '1px solid #ccc', padding: '6px 8px', marginBottom: 10, fontStyle: 'italic' }}>
          Resultado examen periódico de acuerdo a la Ley Nº 19.587/72 Dto. Nº 351/79 y Ley Nº 24.557/95 Dto Nº 658/96, Resol Nº 43/97
        </div>

        <YNTable rows={[
          { label: 'NORMAL', value: result.normal },
          { label: 'ENFERMEDADES INCULPABLES', value: result.inculpableDiseases },
          { label: 'ANORMAL', value: result.abnormal },
          { label: 'Valores fuera de referencia', value: result.outOfRangeValues, indent: true },
          { label: 'Alteraciones Preclínicas', value: result.preclinicalAlterations, indent: true },
          { label: 'Enfermedades Profesionales', value: result.professionalDiseases, indent: true },
        ]} />

        {result.comments && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginBottom: 4 }}>Comentarios:</div>
            <div style={{ fontSize: '9.5pt', paddingLeft: 8 }}>{result.comments}</div>
          </div>
        )}

        <H2>Conclusión</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 16 }}>
          <Check label="Conducta expectante mas control" checked={result.conductExpectantControl} />
          <Check label="Medidas de prevención" checked={result.preventionMeasures} />
          <Check label="Suspender exposición mas control" checked={result.suspendExposureControl} />
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

        <div style={{ marginTop: 72, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, textAlign: 'center', fontSize: '9.5pt' }}>
          <div>
            <div style={{ minHeight: 56, borderBottom: '1px solid #000', marginBottom: 6 }} />
            <div>Firma del Médico</div>
          </div>
          <div>
            <div style={{ minHeight: 56, borderBottom: '1px solid #000', marginBottom: 6 }} />
            <div>Aclaración</div>
          </div>
          <div>
            <div style={{ minHeight: 56, borderBottom: '1px solid #000', marginBottom: 6 }} />
            <div>Lugar y fecha</div>
          </div>
        </div>
      </div>

      {/* ─── PAGE 7: Adjuntos ─── */}
      {attachments.length > 0 && (
        <div className="pv-page" style={{ ...pageStyle, pageBreakAfter: 'auto' }}>
          <PageHeader />
          <H2>Estudios y Adjuntos</H2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 6px', border: '1px solid #999', background: '#eee' }}>Descripción</th>
                <th style={{ textAlign: 'left', padding: '4px 6px', border: '1px solid #999', background: '#eee' }}>Categoría</th>
                <th style={{ textAlign: 'center', padding: '4px 6px', border: '1px solid #999', background: '#eee' }}>Fecha</th>
                <th style={{ textAlign: 'center', padding: '4px 6px', border: '1px solid #999', background: '#eee' }}>Archivos</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((att) => (
                <tr key={att.id}>
                  <td style={{ padding: '4px 6px', border: '1px solid #ddd' }}>{att.description}</td>
                  <td style={{ padding: '4px 6px', border: '1px solid #ddd' }}>{ATTACHMENT_CATEGORY_LABELS[att.category] ?? att.category}</td>
                  <td style={{ textAlign: 'center', padding: '4px 6px', border: '1px solid #ddd' }}>{dateStr(att.uploadedAt)}</td>
                  <td style={{ textAlign: 'center', padding: '4px 6px', border: '1px solid #ddd' }}>{att.files.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
