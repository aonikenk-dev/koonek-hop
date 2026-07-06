export interface Drug {
  id: string;
  drugName: string;
  description: string;
  composition?: string;
  format?: string;
  requiresPrescription: boolean;
}

export interface HealthInsurancePlan {
  code: string;
}

export interface HealthInsurance {
  id: string;
  code: string;
  description: string;
  plans: HealthInsurancePlan[];
}

export interface StudyType {
  id: string;
  code: string;
  description: string;
}

export interface LaboratoryType {
  id: string;
  code: string;
  description: string;
}

export interface Service {
  id: string;
  code: string;
  description: string;
  cost: number;
}

export interface Tag {
  id: string;
  name: string;
}

export const drugs: Drug[] = [
  { id: 'drug1', drugName: 'Ibuprofeno', description: 'Ibupirac 400mg', composition: 'Ibuprofeno 400mg', format: 'Comprimido', requiresPrescription: false },
  { id: 'drug2', drugName: 'Amoxicilina', description: 'Amoxil 500mg', composition: 'Amoxicilina 500mg', format: 'Cápsula', requiresPrescription: true },
  { id: 'drug3', drugName: 'Atorvastatina', description: 'Lipitor 20mg', composition: 'Atorvastatina 20mg', format: 'Comprimido', requiresPrescription: true },
  { id: 'drug4', drugName: 'Losartán', description: 'Cozaar 50mg', composition: 'Losartán potásico 50mg', format: 'Comprimido', requiresPrescription: true },
  { id: 'drug5', drugName: 'Metformina', description: 'Glucophage 850mg', composition: 'Metformina HCl 850mg', format: 'Comprimido', requiresPrescription: true },
  { id: 'drug6', drugName: 'Omeprazol', description: 'Losec 20mg', composition: 'Omeprazol 20mg', format: 'Cápsula', requiresPrescription: false },
  { id: 'drug7', drugName: 'Paracetamol', description: 'Tafirol 1g', composition: 'Paracetamol 1000mg', format: 'Comprimido', requiresPrescription: false },
  { id: 'drug8', drugName: 'Sertralina', description: 'Altruline 50mg', composition: 'Sertralina HCl 50mg', format: 'Comprimido', requiresPrescription: true },
  { id: 'drug9', drugName: 'Levotiroxina', description: 'Eutirox 100mcg', composition: 'Levotiroxina sódica 100mcg', format: 'Comprimido', requiresPrescription: true },
  { id: 'drug10', drugName: 'Azitromicina', description: 'Zitromax 500mg', composition: 'Azitromicina 500mg', format: 'Comprimido', requiresPrescription: true },
];

export const healthInsurances: HealthInsurance[] = [
  { id: 'hi1', code: 'OSDE', description: 'Obra Social de Empresarios', plans: [{ code: '210' }, { code: '310' }, { code: '410' }, { code: '450' }] },
  { id: 'hi2', code: 'SMG', description: 'Swiss Medical Group', plans: [{ code: 'SMG01' }, { code: 'SMG02' }, { code: 'SMG05' }] },
  { id: 'hi3', code: 'IOMA', description: 'IOMA Provincia de Buenos Aires', plans: [{ code: 'A' }, { code: 'B' }, { code: 'C' }] },
  { id: 'hi4', code: 'GAL', description: 'Galeno Argentina', plans: [{ code: 'PLATA' }, { code: 'ORO' }] },
  { id: 'hi5', code: 'MEDIFE', description: 'Medifé Asociación Civil', plans: [{ code: 'BASICO' }, { code: 'INTEGRAL' }] },
  { id: 'hi6', code: 'PART', description: 'Particular (sin cobertura)', plans: [] },
];

export const studyTypes: StudyType[] = [
  { id: 'st1', code: 'ECG', description: 'Electrocardiograma' },
  { id: 'st2', code: 'RX-TX', description: 'Radiografía de Tórax' },
  { id: 'st3', code: 'ECHO-ABD', description: 'Ecografía Abdominal' },
  { id: 'st4', code: 'ECHO-CAR', description: 'Ecocardiograma' },
  { id: 'st5', code: 'TAC-CAB', description: 'TAC de Cráneo' },
  { id: 'st6', code: 'RMN-LUM', description: 'RMN de Columna Lumbar' },
  { id: 'st7', code: 'MAMO', description: 'Mamografía' },
  { id: 'st8', code: 'DENO', description: 'Densitometría Ósea' },
];

export const laboratoryTypes: LaboratoryType[] = [
  { id: 'lt1', code: 'HTO', description: 'Hematocrito' },
  { id: 'lt2', code: 'HGB', description: 'Hemoglobina' },
  { id: 'lt3', code: 'GB', description: 'Glóbulos Blancos' },
  { id: 'lt4', code: 'GLUC', description: 'Glucemia' },
  { id: 'lt5', code: 'UREA', description: 'Urea en sangre' },
  { id: 'lt6', code: 'CREAT', description: 'Creatinina' },
  { id: 'lt7', code: 'COL-T', description: 'Colesterol total' },
  { id: 'lt8', code: 'TGL', description: 'Triglicéridos' },
  { id: 'lt9', code: 'TSH', description: 'Hormona estimulante del tiroides' },
  { id: 'lt10', code: 'VES', description: 'Velocidad de eritrosedimentación' },
];

export const services: Service[] = [
  { id: 'sv1', code: 'CON-GP', description: 'Consulta Médica General', cost: 5000 },
  { id: 'sv2', code: 'CON-ESP', description: 'Consulta Especialista', cost: 8000 },
  { id: 'sv3', code: 'ECG', description: 'Electrocardiograma', cost: 3500 },
  { id: 'sv4', code: 'ECO-ABD', description: 'Ecografía Abdominal', cost: 7000 },
  { id: 'sv5', code: 'LAB-BSC', description: 'Laboratorio básico', cost: 4000 },
  { id: 'sv6', code: 'VAC', description: 'Vacunación', cost: 2500 },
];

export const tags: Tag[] = [
  { id: 'tag1', name: 'Crónico' },
  { id: 'tag2', name: 'Urgente' },
  { id: 'tag3', name: 'Pediátrico' },
  { id: 'tag4', name: 'Geriátrico' },
  { id: 'tag5', name: 'Embarazada' },
  { id: 'tag6', name: 'Cardiopatía' },
  { id: 'tag7', name: 'Diabético' },
  { id: 'tag8', name: 'Oncológico' },
];
