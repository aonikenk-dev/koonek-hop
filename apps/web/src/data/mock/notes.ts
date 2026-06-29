export const notesByPatient: Record<string, string> = {
  p1: '# Notas\n\nPaciente colabora bien con el tratamiento indicado. Revisar adherencia en el próximo control.',
};

export function getNotes(patientId: string): string {
  return notesByPatient[patientId] ?? '';
}
