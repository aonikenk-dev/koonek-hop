export interface HealthRecordEntry {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  notes: string;
}

export const healthRecordEntries: HealthRecordEntry[] = [
  {
    id: 'hr1',
    patientId: 'p1',
    date: '2026-05-12',
    doctorName: 'Dr. Martín Suárez',
    diagnosis: 'Control general',
    notes: 'Paciente asintomática. Signos vitales dentro de parámetros normales. Se indica control en 6 meses.',
  },
  {
    id: 'hr2',
    patientId: 'p1',
    date: '2026-06-22',
    doctorName: 'Dr. Martín Suárez',
    diagnosis: 'Control general',
    notes: 'Continúa asintomática. Se solicitan análisis de rutina.',
  },
  {
    id: 'hr3',
    patientId: 'p2',
    date: '2026-06-10',
    doctorName: 'Dr. Martín Suárez',
    diagnosis: 'Esquema de vacunación',
    notes: 'Se administra dosis correspondiente según calendario. Sin reacciones adversas.',
  },
  {
    id: 'hr4',
    patientId: 'p3',
    date: '2026-06-20',
    doctorName: 'Dra. Valentina Ríos',
    diagnosis: 'Seguimiento pediátrico',
    notes: 'Buena evolución de peso y talla. Se mantiene plan alimentario.',
  },
];
