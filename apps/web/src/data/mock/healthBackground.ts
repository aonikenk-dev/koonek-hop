export interface BoolText {
  checked: boolean;
  text: string;
}

function bt(checked = false, text = ''): BoolText {
  return { checked, text };
}

export const PATHOLOGICAL_KEYS = [
  'heartDisease',
  'injuries',
  'diabetes',
  'arterialHypertension',
  'endocrineMetabolic',
  'respiratory',
  'glaucoma',
  'digestive',
  'oncological',
  'neurological',
  'infectological',
  'nephrourological',
  'gynecoObstetrics',
  'std',
  'hematological',
  'transfusions',
  'hospitalizations',
  'surgeries',
] as const;
export type PathologicalKey = (typeof PATHOLOGICAL_KEYS)[number];

export const NON_PATHOLOGICAL_KEYS = ['smoking', 'alcoholism', 'drugs', 'vaccines', 'physicalActivities'] as const;
export type NonPathologicalKey = (typeof NON_PATHOLOGICAL_KEYS)[number];

export const HEREDITARY_KEYS = [
  'heartDisease',
  'thyroid',
  'diabetes',
  'arterialHypertension',
  'glaucoma',
  'neurological',
  'oncological',
] as const;
export type HereditaryKey = (typeof HEREDITARY_KEYS)[number];

export interface HealthBackground {
  patientId: string;
  allergies: string[];
  allergiesExtraComments: string;
  activeDrugs: string[];
  activeDrugsExtraComments: string;
  pathological: Record<PathologicalKey, BoolText>;
  pathologicalOthers: string;
  nonPathological: Record<NonPathologicalKey, BoolText>;
  nonPathologicalOthers: string;
  hereditary: Record<HereditaryKey, BoolText>;
  hereditaryOthers: string;
  psychiatric: string;
  nutritional: string;
}

function emptyRecord<K extends string>(keys: readonly K[]): Record<K, BoolText> {
  return Object.fromEntries(keys.map((k) => [k, bt()])) as Record<K, BoolText>;
}

function empty(patientId: string): HealthBackground {
  return {
    patientId,
    allergies: [],
    allergiesExtraComments: '',
    activeDrugs: [],
    activeDrugsExtraComments: '',
    pathological: emptyRecord(PATHOLOGICAL_KEYS),
    pathologicalOthers: '',
    nonPathological: emptyRecord(NON_PATHOLOGICAL_KEYS),
    nonPathologicalOthers: '',
    hereditary: emptyRecord(HEREDITARY_KEYS),
    hereditaryOthers: '',
    psychiatric: '',
    nutritional: '',
  };
}

export const healthBackgroundByPatient: Record<string, HealthBackground> = {
  p1: {
    ...empty('p1'),
    allergies: ['Penicilina'],
    allergiesExtraComments: 'Reacción cutánea leve.',
    pathological: {
      ...emptyRecord(PATHOLOGICAL_KEYS),
      arterialHypertension: bt(true, 'Diagnosticada en 2022, tratada con enalapril.'),
    },
    hereditary: {
      ...emptyRecord(HEREDITARY_KEYS),
      diabetes: bt(true, 'Madre, diagnosticada a los 50 años.'),
    },
    nonPathological: {
      ...emptyRecord(NON_PATHOLOGICAL_KEYS),
      physicalActivities: bt(true, 'Running, 3 veces por semana.'),
    },
  },
};

export function getHealthBackground(patientId: string): HealthBackground {
  return healthBackgroundByPatient[patientId] ?? empty(patientId);
}
