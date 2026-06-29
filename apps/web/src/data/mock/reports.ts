// Standalone aggregated mock data for the Reports page — not derived from
// the live patients/appointments mocks, same pattern as Kaiken's report pages.

/** Visit counts for the 6 months ending in the current month, oldest first. */
export const monthlyVisitsLast6 = [54, 61, 58, 70, 65, 76];

export const patientsByAgeGroup = [
  { group: '0-12', count: 18 },
  { group: '13-18', count: 9 },
  { group: '19-35', count: 64 },
  { group: '36-50', count: 52 },
  { group: '51-65', count: 37 },
  { group: '65+', count: 21 },
];

export const topConsultationReasons = [
  { reason: 'Control general', count: 34 },
  { reason: 'Vacunación', count: 21 },
  { reason: 'Seguimiento', count: 18 },
  { reason: 'Resultados de laboratorio', count: 12 },
  { reason: 'Primera consulta', count: 9 },
];
