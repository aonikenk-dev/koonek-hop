export interface PrescriptionItem {
  drug: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  notes?: string;
  /** Chronic/ongoing treatment — patient picks this up regularly. */
  frequent: boolean;
  /** Controlled substance requiring a duplicate (triplicado) form. */
  requiresDuplicate: boolean;
  /** Long-term treatment, not a one-off course. */
  longTerm: boolean;
}

export const prescriptions: Prescription[] = [
  {
    id: 'rx1',
    patientId: 'p1',
    patientName: 'Lucía Fernández',
    doctorName: 'Dr. Martín Suárez',
    date: '2026-06-22',
    diagnosis: 'Cefalea tensional',
    items: [{ drug: 'Ibuprofeno 400mg', dosage: '1 comprimido', frequency: 'Cada 8 horas por 5 días' }],
    notes: 'Tomar con alimentos.',
    frequent: false,
    requiresDuplicate: false,
    longTerm: false,
  },
  {
    id: 'rx2',
    patientId: 'p2',
    patientName: 'Tomás Ibarra',
    doctorName: 'Dr. Martín Suárez',
    date: '2026-06-10',
    diagnosis: 'Esquema de vacunación',
    items: [{ drug: 'Vacuna antigripal', dosage: '0.5ml', frequency: 'Dosis única' }],
    frequent: false,
    requiresDuplicate: false,
    longTerm: false,
  },
  {
    id: 'rx3',
    patientId: 'p3',
    patientName: 'Carla Gómez',
    doctorName: 'Dra. Valentina Ríos',
    date: '2026-06-20',
    diagnosis: 'Faringitis bacteriana',
    items: [
      { drug: 'Amoxicilina 500mg', dosage: '1 comprimido', frequency: 'Cada 12 horas por 7 días' },
      { drug: 'Paracetamol 500mg', dosage: '1 comprimido', frequency: 'Cada 8 horas si hay fiebre' },
    ],
    notes: 'Completar el tratamiento aunque mejoren los síntomas.',
    frequent: false,
    requiresDuplicate: false,
    longTerm: false,
  },
];
