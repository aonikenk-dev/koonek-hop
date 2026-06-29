export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive';

export interface ClinicalInsight {
  id: string;
  severity: InsightSeverity;
  confidence: number;
  params?: Record<string, string | number>;
}

export const insights: ClinicalInsight[] = [
  { id: 'overdueControls', severity: 'warning', confidence: 88, params: { count: 7 } },
  { id: 'chronicRenewal', severity: 'critical', confidence: 95, params: { count: 3 } },
  { id: 'consultationTrend', severity: 'info', confidence: 76, params: { reason: 'control general', value: 18 } },
  { id: 'vaccinationCoverage', severity: 'positive', confidence: 82, params: { value: 12 } },
];
