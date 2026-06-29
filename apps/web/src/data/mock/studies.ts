export const STUDY_TYPES = [
  'Radiografía',
  'Ecografía',
  'Resonancia Magnética',
  'Tomografía',
  'Electrocardiograma',
] as const;

export interface StudyFile {
  id: string;
  name: string;
  uploadedDate: string;
  /** Session-only object URL for files picked via <input type="file">, lets them be opened/viewed. */
  url?: string;
}

export interface Study {
  id: string;
  patientId: string;
  date: string;
  studyType: string;
  link?: string;
  files: StudyFile[];
}

export const studies: Study[] = [
  {
    id: 'st1',
    patientId: 'p1',
    date: '2026-04-02',
    studyType: 'Ecografía',
    link: 'https://sistema-externo.example.com/estudios/st1',
    files: [],
  },
];
