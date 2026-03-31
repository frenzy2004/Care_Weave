export type DrugClass = 
  | 'anti-inflammatory'
  | 'immunosuppressant'
  | 'biologic'
  | 'antispasmodic'
  | 'probiotic'
  | 'supplement'
  | 'other';

export type SymptomType = 
  | 'fatigue'
  | 'gi_issues'
  | 'joint_pain'
  | 'heart_symptoms'
  | 'brain_fog'
  | 'headache'
  | 'skin_issues'
  | 'other';

export type Severity = 'mild' | 'moderate' | 'severe';

export type EventType = 'symptom' | 'medication_start' | 'medication_stop' | 'visit' | 'note' | 'flare';

export interface Patient {
  name: string;
  conditions: string[];
}

export interface SymptomEntry {
  id: string;
  date: string;
  painLevel: number;
  symptoms: { type: SymptomType; severity: Severity }[];
  notes: string;
  providerId?: string;
  isFlareDay: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  drugClass: DrugClass;
  startDate: string;
  endDate?: string;
  providerId?: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
}

export interface Visit {
  id: string;
  date: string;
  providerId: string;
  purpose: string;
  notes: string;
  linkedMedIds: string[];
  linkedSymptomIds: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  description: string;
  providerId?: string;
  sourceId: string;
}

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface Insight {
  id: string;
  text: string;
  confidence: ConfidenceLevel;
  instanceCount: number;
  category: 'improvement' | 'correlation' | 'warning' | 'pattern';
}

export const SYMPTOM_LABELS: Record<SymptomType, string> = {
  fatigue: 'Fatigue',
  gi_issues: 'GI Issues',
  joint_pain: 'Joint Pain',
  heart_symptoms: 'Heart Symptoms',
  brain_fog: 'Brain Fog',
  headache: 'Headache',
  skin_issues: 'Skin Issues',
  other: 'Other',
};

export const DRUG_CLASS_LABELS: Record<DrugClass, string> = {
  'anti-inflammatory': 'Anti-inflammatory',
  immunosuppressant: 'Immunosuppressant',
  biologic: 'Biologic',
  antispasmodic: 'Antispasmodic',
  probiotic: 'Probiotic',
  supplement: 'Supplement',
  other: 'Other',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  mild: 'hsl(var(--chart-teal))',
  moderate: 'hsl(var(--chart-amber))',
  severe: 'hsl(var(--chart-red))',
};
