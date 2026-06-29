export const LABORATORY_TYPES = [
  'Hemograma',
  'Glucemia',
  'Perfil lipídico',
  'Función renal',
  'Función hepática',
  'Orina completa',
] as const;

export interface LabFile {
  id: string;
  name: string;
  uploadedDate: string;
  /** Session-only object URL for files picked via <input type="file">, lets them be opened/viewed. */
  url?: string;
}

export interface LabItem {
  laboratoryType: string;
  value: string;
}

export interface LabExam {
  id: string;
  patientId: string;
  date: string;
  items: LabItem[];
  files: LabFile[];
}

export const laboratories: LabExam[] = [
  {
    id: 'lab1',
    patientId: 'p1',
    date: '2026-05-15',
    items: [
      { laboratoryType: 'Hemograma', value: 'Dentro de parámetros normales' },
      { laboratoryType: 'Glucemia', value: '92 mg/dL' },
    ],
    files: [{ id: 'lf1', name: 'hemograma-2026-05-15.pdf', uploadedDate: '2026-05-15' }],
  },
];
