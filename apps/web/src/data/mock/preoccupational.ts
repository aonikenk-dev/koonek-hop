export type ExamType = 'preoccupational' | 'periodic' | 'egress';
export type AptitudeResult =
  // preoccupational / egress
  | 'apt'
  | 'aptWithPreexistence'
  | 'transitoryInapt'
  | 'inapt'
  // periodic
  | 'continuesApt'
  | 'continuesAptWithRestrictions'
  | 'requiresPeriodicControl'
  | 'requiresSpecialistConsultation'
  | null;
export type ExamStatus = 'draft' | 'completed';

export interface PreemploymentPatient {
  id: string;
  firstName: string;
  lastName: string;
  nationalIdType: 'DNI' | 'LE' | 'OTRO';
  documentId: string;
  cuil: string;
  dateOfBirth: string;
  birthPlace: string;
  maritalStatus: string;
  numberOfChildren: number;
  address: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  linkedPatientId?: string;
  addedToPatients: boolean;
}

export interface MedicalConditions {
  dizziness: boolean;
  excessiveNervousness: boolean;
  convulsions: boolean;
  headaches: boolean;
  insomnia: boolean;
  memoryLoss: boolean;
  neuritis: boolean;
  brucellosis: boolean;
  depression: boolean;
  malaria: boolean;
  rheumaticFever: boolean;
  venerealDiseases: boolean;
  tuberculosis: boolean;
  cancer: boolean;
  asthma: boolean;
  urticaria: boolean;
  skinDiseases: boolean;
  visionDisorders: boolean;
  hearingLoss: boolean;
  earDischarge: boolean;
  frequentColds: boolean;
  badTeeth: boolean;
  recurrentAngina: boolean;
  chronicCough: boolean;
  sinusitis: boolean;
  bloodInSputum: boolean;
  nightSweats: boolean;
  weightLoss: boolean;
  chestPain: boolean;
  shortnessOfBreath: boolean;
  heartPalpitations: boolean;
  highBloodPressure: boolean;
  gastricUlcer: boolean;
  acidity: boolean;
  frequentIndigestion: boolean;
  jaundice: boolean;
  hernias: boolean;
  hemorrhoids: boolean;
  painfulJoints: boolean;
  urinationDifficulties: boolean;
  fracturesOrDislocations: boolean;
  flatFeet: boolean;
  kneePain: boolean;
  backPain: boolean;
  shoulderPain: boolean;
  varicoseVeins: boolean;
}

export const EMPTY_CONDITIONS: MedicalConditions = {
  dizziness: false, excessiveNervousness: false, convulsions: false, headaches: false,
  insomnia: false, memoryLoss: false, neuritis: false, brucellosis: false, depression: false,
  malaria: false, rheumaticFever: false, venerealDiseases: false, tuberculosis: false,
  cancer: false, asthma: false, urticaria: false, skinDiseases: false, visionDisorders: false,
  hearingLoss: false, earDischarge: false, frequentColds: false, badTeeth: false,
  recurrentAngina: false, chronicCough: false, sinusitis: false, bloodInSputum: false,
  nightSweats: false, weightLoss: false, chestPain: false, shortnessOfBreath: false,
  heartPalpitations: false, highBloodPressure: false, gastricUlcer: false, acidity: false,
  frequentIndigestion: false, jaundice: false, hernias: false, hemorrhoids: false,
  painfulJoints: false, urinationDifficulties: false, fracturesOrDislocations: false,
  flatFeet: false, kneePain: false, backPain: false, shoulderPain: false, varicoseVeins: false,
};

export interface ClinicalExam {
  height: string;
  weight: string;
  habit: string;
  gait: string;
  generalState: string;
  skinNormal: boolean;
  skinEczemas: boolean;
  skinJaundice: boolean;
  skinDermatitis: boolean;
  skinBurns: boolean;
  skinScars: boolean;
  skinLocation: string;
  eyeRightNearVision: string;
  eyeRightColorVision: string;
  eyeLeftNearVision: string;
  eyeLeftColorVision: string;
  nasalSeptumNormal: boolean;
  hearingRightNormal: boolean;
  hearingLeftNormal: boolean;
  respiratoryEmphysema: boolean;
  respiratoryAsthma: boolean;
  respiratoryDyspnea: boolean;
  respiratoryThoraxNormal: boolean;
  respiratoryAuscultationNormal: boolean;
  respiratoryObservations: string;
  abdomenNormal: boolean;
  abdomenHepatomegaly: boolean;
  abdomenSplenomegaly: boolean;
  abdomenHernias: boolean;
  abdomenHerniaLocation: string;
  abdomenEventrations: boolean;
  abdomenEventrationLocations: string;
  cardiovascularBP: string;
  cardiovascularPulse: string;
  cardiovascularAuscultationNormal: boolean;
  cardiovascularRhythmNormal: boolean;
  musculoLumbarSacralNormal: boolean;
  musculoCervicalNormal: boolean;
  musculoDorsalNormal: boolean;
  musculoUpperLimbsNormal: boolean;
  musculoLowerLimbsNormal: boolean;
  musculoVaricoseVeinsNormal: boolean;
  neuroEpilepsy: boolean;
  neuroVertigo: boolean;
  neuroTremors: boolean;
  neuroGaitDisorder: boolean;
  neuroReflexesNormal: boolean;
  clinicalObservations: string;
}

export interface SpirometryAntecedents {
  frequentColds: boolean;
  sinusitis: boolean;
  prolongedBronchitis: boolean;
  asthma: boolean;
  pneumonia: boolean;
  tbc: boolean;
  otherRespiratory: string;
  pleurisy: boolean;
  pneumothorax: boolean;
  kyphosis: boolean;
  scoliosis: boolean;
  thoracicTrauma: boolean;
  arterialHypertension: boolean;
  valvulopathy: boolean;
  coronaryDisease: boolean;
  otherCardiovascular: string;
  currentCough: boolean;
  currentExpectoration: boolean;
  currentDyspnea: boolean;
  currentThoracicPain: boolean;
  companyTenure: string;
  taskDuration: string;
  sport: string;
  smokingAmount: string;
  smokingStartAge: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
}

export interface PreoccupationalAttachment {
  id: string;
  description: string;
  category: 'spirometry' | 'ecg' | 'xray' | 'audiometry' | 'drugTest' | 'lab' | 'psycho' | 'eeg' | 'other';
  uploadedAt: string;
  files: AttachmentFile[];
}

export type FinalExamResult = 'normal' | 'pathological' | null;

export interface XrayExam {
  thoraxObservations: string;
  cervicalObservations: string;
  lumbosacralObservations: string;
  otherObservations: string;
  finalExam: {
    fisico: FinalExamResult;
    dermatologico: FinalExamResult;
    osteoarticularMMSS: FinalExamResult;
    osteoarticularMMII: FinalExamResult;
    neumonologico: FinalExamResult;
    neurologico: FinalExamResult;
    hematologico: FinalExamResult;
    orl: FinalExamResult;
    apDigestivo: FinalExamResult;
    psicologico: FinalExamResult;
    cardiovascular: FinalExamResult;
    urologicoNefrologico: FinalExamResult;
    oftalmologico: FinalExamResult;
    endocrinologico: FinalExamResult;
    ginecologico: FinalExamResult;
    audiometria: FinalExamResult;
    espirometria: FinalExamResult;
    laringoscopia: FinalExamResult;
    rxTx: FinalExamResult;
    rxCLS: FinalExamResult;
    rxMunecas: FinalExamResult;
    ecg: FinalExamResult;
    laboratorioInespecifico: FinalExamResult;
    laboratorioToxicologico: FinalExamResult;
  };
}

export interface ExamResult {
  normal: boolean;
  inculpableDiseases: boolean;
  abnormal: boolean;
  outOfRangeValues: boolean;
  preclinicalAlterations: boolean;
  professionalDiseases: boolean;
  comments: string;
  conductExpectantControl: boolean;
  suspendExposureControl: boolean;
  preventionMeasures: boolean;
  treatment: boolean;
  aptitude: AptitudeResult;
  aptitudeDetail: string;
}

export interface ExamRequirements {
  clinicalExam: boolean;
  spirometry: boolean;
  xray: boolean;
  audiometry: boolean;
  other: string;
}

export const EMPTY_REQUIREMENTS: ExamRequirements = {
  clinicalExam: false,
  spirometry: false,
  xray: false,
  audiometry: false,
  other: '',
};

export interface PreoccupationalExam {
  id: string;
  examType: ExamType;
  date: string | null;
  summonDate?: string | null;
  requirements: ExamRequirements;
  company: string;
  place: string;
  status: ExamStatus;
  patient: PreemploymentPatient;
  position: string;
  tasks: string;
  declaration: {
    leftJobForHealth: boolean;
    pendingCompensation: boolean;
    exemptedFromMilitary: boolean;
    deniedLifeInsurance: boolean;
  };
  habitsDeclaration: {
    smokes: boolean;
    drinks: boolean;
    drugs: boolean;
    drugsDetail: string;
  };
  familyHistory: {
    hta: boolean;
    diabetes: boolean;
    neurological: boolean;
    neoplastic: boolean;
    other: string;
  };
  medicalHistory: {
    surgeries: string;
    conditions: MedicalConditions;
    medicalObservations: string;
  };
  personalAntecedents: {
    clinicalSurgicalPathology: string;
    permanentMedication: boolean;
    permanentMedicationDetail: string;
    smokerAmount: string;
    habits: string;
    allergic: boolean;
    allergicType: string;
    professionalDiseases: string;
    laborIncapacity: string;
  };
  clinicalExam: ClinicalExam;
  spirometry: SpirometryAntecedents;
  xrayExam: XrayExam;
  result: ExamResult;
  attachments: PreoccupationalAttachment[];
  swornDeclarationFiles?: AttachmentFile[];
  spirometryFiles?: AttachmentFile[];
  xrayFiles?: AttachmentFile[];
}

export function emptyPreemploymentPatient(): PreemploymentPatient {
  return {
    id: `pp-${Date.now()}`,
    firstName: '',
    lastName: '',
    nationalIdType: 'DNI',
    documentId: '',
    cuil: '',
    dateOfBirth: '',
    birthPlace: '',
    maritalStatus: '',
    numberOfChildren: 0,
    address: '',
    city: '',
    postalCode: '',
    state: '',
    country: 'Argentina',
    linkedPatientId: undefined,
    addedToPatients: false,
  };
}

export function emptyClinicalExam(): ClinicalExam {
  return {
    height: '', weight: '', habit: 'Normal', gait: 'Eubásico', generalState: 'Bueno',
    skinNormal: true, skinEczemas: false, skinJaundice: false, skinDermatitis: false,
    skinBurns: false, skinScars: false, skinLocation: '',
    eyeRightNearVision: '10/10', eyeRightColorVision: '10/10',
    eyeLeftNearVision: '10/10', eyeLeftColorVision: '10/10',
    nasalSeptumNormal: true, hearingRightNormal: true, hearingLeftNormal: true,
    respiratoryEmphysema: false, respiratoryAsthma: false, respiratoryDyspnea: false,
    respiratoryThoraxNormal: true, respiratoryAuscultationNormal: true, respiratoryObservations: '',
    abdomenNormal: true, abdomenHepatomegaly: false, abdomenSplenomegaly: false,
    abdomenHernias: false, abdomenHerniaLocation: '', abdomenEventrations: false, abdomenEventrationLocations: '',
    cardiovascularBP: '', cardiovascularPulse: '',
    cardiovascularAuscultationNormal: true, cardiovascularRhythmNormal: true,
    musculoLumbarSacralNormal: true, musculoCervicalNormal: true, musculoDorsalNormal: true,
    musculoUpperLimbsNormal: true, musculoLowerLimbsNormal: true, musculoVaricoseVeinsNormal: true,
    neuroEpilepsy: false, neuroVertigo: false, neuroTremors: false, neuroGaitDisorder: false,
    neuroReflexesNormal: true, clinicalObservations: '',
  };
}

export function emptySpirometry(): SpirometryAntecedents {
  return {
    frequentColds: false, sinusitis: false, prolongedBronchitis: false, asthma: false,
    pneumonia: false, tbc: false, otherRespiratory: '',
    pleurisy: false, pneumothorax: false, kyphosis: false, scoliosis: false, thoracicTrauma: false,
    arterialHypertension: false, valvulopathy: false, coronaryDisease: false, otherCardiovascular: '',
    currentCough: false, currentExpectoration: false, currentDyspnea: false, currentThoracicPain: false,
    companyTenure: '', taskDuration: '', sport: '', smokingAmount: '', smokingStartAge: '',
  };
}

export function emptyXrayExam(): XrayExam {
  return {
    thoraxObservations: '',
    cervicalObservations: '',
    lumbosacralObservations: '',
    otherObservations: '',
    finalExam: {
      fisico: null, dermatologico: null, osteoarticularMMSS: null, osteoarticularMMII: null,
      neumonologico: null, neurologico: null, hematologico: null, orl: null,
      apDigestivo: null, psicologico: null, cardiovascular: null, urologicoNefrologico: null,
      oftalmologico: null, endocrinologico: null, ginecologico: null, audiometria: null,
      espirometria: null, laringoscopia: null, rxTx: null, rxCLS: null, rxMunecas: null,
      ecg: null, laboratorioInespecifico: null, laboratorioToxicologico: null,
    },
  };
}

export function emptyResult(): ExamResult {
  return {
    normal: false, inculpableDiseases: false, abnormal: false,
    outOfRangeValues: false, preclinicalAlterations: false, professionalDiseases: false,
    comments: '', conductExpectantControl: false, suspendExposureControl: false,
    preventionMeasures: false, treatment: false, aptitude: null, aptitudeDetail: '',
  };
}

// ── Mock data ────────────────────────────────────────────────────────────────

export const preoccupationalExams: PreoccupationalExam[] = [
  {
    id: 'preocc1',
    examType: 'periodic',
    date: '2020-11-05',
    company: 'Gustavo Alvarez',
    place: 'Pto. San Julián',
    requirements: EMPTY_REQUIREMENTS,
    status: 'completed',
    patient: {
      id: 'pp1',
      firstName: 'Enzo Sebastián',
      lastName: 'Ledezma Maciel',
      nationalIdType: 'DNI',
      documentId: '40701999',
      cuil: '',
      dateOfBirth: '1997-09-10',
      birthPlace: 'Corrientes',
      maritalStatus: 'Soltero',
      numberOfChildren: 1,
      address: 'Piedra Buena 1171',
      city: 'Pto. San Julián',
      postalCode: '9310',
      state: 'Santa Cruz',
      country: 'Argentina',
      addedToPatients: false,
    },
    position: 'Operario',
    tasks: 'Operario',
    declaration: {
      leftJobForHealth: false,
      pendingCompensation: false,
      exemptedFromMilitary: true,
      deniedLifeInsurance: false,
    },
    habitsDeclaration: { smokes: true, drinks: true, drugs: false, drugsDetail: '' },
    familyHistory: { hta: false, diabetes: false, neurological: false, neoplastic: false, other: '' },
    medicalHistory: {
      surgeries: '',
      conditions: { ...EMPTY_CONDITIONS },
      medicalObservations: '',
    },
    personalAntecedents: {
      clinicalSurgicalPathology: 'No',
      permanentMedication: false,
      permanentMedicationDetail: '',
      smokerAmount: '10 por día',
      habits: 'Bebe ocasional',
      allergic: false,
      allergicType: 'No',
      professionalDiseases: 'No',
      laborIncapacity: '',
    },
    clinicalExam: {
      ...emptyClinicalExam(),
      height: '173',
      weight: '70',
      cardiovascularBP: '100/60',
      cardiovascularPulse: '60',
    },
    spirometry: {
      ...emptySpirometry(),
      smokingAmount: 'Hasta 10 cigarrillos',
      smokingStartAge: 'Entre los 15 y 20 años',
    },
    xrayExam: {
      ...emptyXrayExam(),
      thoraxObservations: 'TRAMA BRONCOPULMONAR CONSERVADA S.C.V.NORMAL',
      lumbosacralObservations: 'NO SE OBSERVAN ALTERACIONES OSTEOARTICULARES',
      finalExam: {
        ...emptyXrayExam().finalExam,
        fisico: 'normal', dermatologico: 'normal', osteoarticularMMSS: 'normal',
        osteoarticularMMII: 'normal', neumonologico: 'normal', neurologico: 'normal',
        hematologico: 'normal', orl: 'normal', apDigestivo: 'normal',
        psicologico: 'normal', cardiovascular: 'normal', urologicoNefrologico: 'normal',
        oftalmologico: 'normal', endocrinologico: 'normal', audiometria: 'normal',
        espirometria: 'normal', laringoscopia: 'normal', rxTx: 'normal', rxCLS: 'normal',
        laboratorioInespecifico: 'normal', laboratorioToxicologico: 'pathological',
      },
    },
    result: {
      normal: false,
      inculpableDiseases: true,
      abnormal: false,
      outOfRangeValues: false,
      preclinicalAlterations: false,
      professionalDiseases: false,
      comments: 'NO APTO PARA EL DESARROLLO DE SUS TAREAS HABITUALES. TEST DE DROGAS POSITIVO A MARIHUANA.',
      conductExpectantControl: false,
      suspendExposureControl: false,
      preventionMeasures: false,
      treatment: false,
      aptitude: 'inapt',
      aptitudeDetail: '',
    },
    attachments: [
      { id: 'att1', description: 'Prueba Función Pulmonar', category: 'spirometry', uploadedAt: '2020-11-05', files: [] },
      { id: 'att2', description: 'Electrocardiograma', category: 'ecg', uploadedAt: '2020-11-05', files: [] },
      { id: 'att3', description: 'Estudio Funcional Audición', category: 'audiometry', uploadedAt: '2020-11-05', files: [] },
      { id: 'att4', description: 'Informe Radiológico Tórax + Lumbar', category: 'xray', uploadedAt: '2020-11-05', files: [] },
      { id: 'att5', description: 'Test de Drogas de Abuso', category: 'drugTest', uploadedAt: '2020-11-05', files: [] },
      { id: 'att6', description: 'Test de Alcoholemia', category: 'lab', uploadedAt: '2020-11-06', files: [] },
      { id: 'att7', description: 'Informe Psicotécnico Laboral', category: 'psycho', uploadedAt: '2020-11-06', files: [] },
      { id: 'att8', description: 'Electroencefalograma', category: 'eeg', uploadedAt: '2020-11-06', files: [] },
    ],
  },
  {
    id: 'preocc2',
    examType: 'preoccupational',
    date: '2024-03-15',
    company: 'Clínica San Martín',
    place: 'Río Gallegos',
    requirements: EMPTY_REQUIREMENTS,
    status: 'completed',
    patient: {
      id: 'pp2',
      firstName: 'Ana Laura',
      lastName: 'González Martínez',
      nationalIdType: 'DNI',
      documentId: '32456789',
      cuil: '27-32456789-3',
      dateOfBirth: '1986-04-22',
      birthPlace: 'Buenos Aires',
      maritalStatus: 'Casada',
      numberOfChildren: 2,
      address: 'Av. Kirchner 540',
      city: 'Río Gallegos',
      postalCode: '9400',
      state: 'Santa Cruz',
      country: 'Argentina',
      addedToPatients: false,
    },
    position: 'Enfermera',
    tasks: 'Enfermería general, guardia',
    declaration: {
      leftJobForHealth: false,
      pendingCompensation: false,
      exemptedFromMilitary: false,
      deniedLifeInsurance: false,
    },
    habitsDeclaration: { smokes: false, drinks: false, drugs: false, drugsDetail: '' },
    familyHistory: { hta: true, diabetes: false, neurological: false, neoplastic: false, other: '' },
    medicalHistory: {
      surgeries: 'Cesárea 2015',
      conditions: { ...EMPTY_CONDITIONS },
      medicalObservations: '',
    },
    personalAntecedents: {
      clinicalSurgicalPathology: 'Cesárea 2015',
      permanentMedication: false,
      permanentMedicationDetail: '',
      smokerAmount: '',
      habits: 'No fuma, no bebe',
      allergic: false,
      allergicType: '',
      professionalDiseases: 'No',
      laborIncapacity: '',
    },
    clinicalExam: {
      ...emptyClinicalExam(),
      height: '162',
      weight: '58',
      cardiovascularBP: '110/70',
      cardiovascularPulse: '72',
    },
    spirometry: { ...emptySpirometry() },
    xrayExam: {
      ...emptyXrayExam(),
      finalExam: {
        ...emptyXrayExam().finalExam,
        fisico: 'normal', dermatologico: 'normal', osteoarticularMMSS: 'normal',
        osteoarticularMMII: 'normal', neumonologico: 'normal', orl: 'normal',
        cardiovascular: 'normal', oftalmologico: 'normal', laboratorioInespecifico: 'normal',
      },
    },
    result: {
      normal: true,
      inculpableDiseases: false,
      abnormal: false,
      outOfRangeValues: false,
      preclinicalAlterations: false,
      professionalDiseases: false,
      comments: 'Sin hallazgos patológicos. Apta para el puesto.',
      conductExpectantControl: false,
      suspendExposureControl: false,
      preventionMeasures: false,
      treatment: false,
      aptitude: 'apt',
      aptitudeDetail: '',
    },
    attachments: [
      { id: 'att9', description: 'Laboratorio general', category: 'lab', uploadedAt: '2024-03-15', files: [] },
      { id: 'att10', description: 'ECG', category: 'ecg', uploadedAt: '2024-03-15', files: [] },
    ],
  },
  {
    id: 'preocc3',
    examType: 'preoccupational',
    date: '2024-06-20',
    company: 'Constructora Patagónica S.A.',
    place: 'Caleta Olivia',
    requirements: EMPTY_REQUIREMENTS,
    status: 'draft',
    patient: {
      id: 'pp3',
      firstName: 'Carlos Alejandro',
      lastName: 'Rodríguez Paz',
      nationalIdType: 'DNI',
      documentId: '28901234',
      cuil: '',
      dateOfBirth: '1980-11-08',
      birthPlace: 'Mendoza',
      maritalStatus: 'Casado',
      numberOfChildren: 3,
      address: 'Los Pinos 892',
      city: 'Caleta Olivia',
      postalCode: '9011',
      state: 'Santa Cruz',
      country: 'Argentina',
      addedToPatients: false,
    },
    position: 'Albañil',
    tasks: 'Construcción en altura, manejo de materiales pesados',
    declaration: {
      leftJobForHealth: false,
      pendingCompensation: false,
      exemptedFromMilitary: false,
      deniedLifeInsurance: false,
    },
    habitsDeclaration: { smokes: true, drinks: false, drugs: false, drugsDetail: '' },
    familyHistory: { hta: true, diabetes: true, neurological: false, neoplastic: false, other: '' },
    medicalHistory: {
      surgeries: '',
      conditions: { ...EMPTY_CONDITIONS, backPain: true, shoulderPain: true },
      medicalObservations: '',
    },
    personalAntecedents: {
      clinicalSurgicalPathology: 'No',
      permanentMedication: false,
      permanentMedicationDetail: '',
      smokerAmount: '5 por día',
      habits: '',
      allergic: false,
      allergicType: '',
      professionalDiseases: 'No',
      laborIncapacity: '',
    },
    clinicalExam: emptyClinicalExam(),
    spirometry: emptySpirometry(),
    xrayExam: emptyXrayExam(),
    result: emptyResult(),
    attachments: [],
  },
];
