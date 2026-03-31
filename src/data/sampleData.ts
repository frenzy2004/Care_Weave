import { Patient, SymptomEntry, Medication, Provider, Visit } from '@/types/health';

export const samplePatient: Patient = {
  name: 'Alex Morgan',
  conditions: ['IBS', 'Autoimmune Disorder'],
};

export const sampleProviders: Provider[] = [
  { id: 'p1', name: 'Dr. Sarah Chen', specialty: 'Gastroenterologist', clinic: 'City GI Center' },
  { id: 'p2', name: 'Dr. James Park', specialty: 'Rheumatologist', clinic: 'Metro Rheumatology' },
  { id: 'p3', name: 'Dr. Emily Watson', specialty: 'General Practitioner', clinic: 'Greenfield Medical' },
  { id: 'p4', name: 'Dr. Raj Patel', specialty: 'Immunologist', clinic: 'University Immunology Clinic' },
];

export const sampleMedications: Medication[] = [
  { id: 'm1', name: 'Mesalamine', dosage: '800mg', frequency: 'Twice daily', drugClass: 'anti-inflammatory', startDate: '2025-10-01', endDate: '2025-12-15', providerId: 'p1' },
  { id: 'm2', name: 'Azathioprine', dosage: '50mg', frequency: 'Once daily', drugClass: 'immunosuppressant', startDate: '2025-12-20', providerId: 'p2' },
  { id: 'm3', name: 'Dicyclomine', dosage: '20mg', frequency: 'As needed', drugClass: 'antispasmodic', startDate: '2025-10-15', endDate: '2026-01-10', providerId: 'p1' },
  { id: 'm4', name: 'Probiotics (VSL#3)', dosage: '1 sachet', frequency: 'Once daily', drugClass: 'probiotic', startDate: '2025-11-01', providerId: 'p3' },
  { id: 'm5', name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', drugClass: 'supplement', startDate: '2025-10-01', providerId: 'p3' },
  { id: 'm6', name: 'Adalimumab', dosage: '40mg', frequency: 'Bi-weekly injection', drugClass: 'biologic', startDate: '2026-02-01', providerId: 'p4' },
];

const generateSymptoms = (): SymptomEntry[] => {
  const symptoms: SymptomEntry[] = [];
  const startDate = new Date('2025-10-01');
  
  const patterns = [
    // Oct: high severity, pre-treatment
    ...Array.from({ length: 20 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(i * 1.5));
      return {
        date,
        painLevel: 5 + Math.floor(Math.random() * 4),
        isFlare: i % 5 === 0,
        mainSymptoms: ['gi_issues', 'fatigue', 'joint_pain'] as const,
      };
    }),
    // Nov-Dec: moderate, on anti-inflammatory
    ...Array.from({ length: 25 }, (_, i) => {
      const date = new Date('2025-11-01');
      date.setDate(date.getDate() + Math.floor(i * 2.4));
      return {
        date,
        painLevel: 3 + Math.floor(Math.random() * 3),
        isFlare: i % 8 === 0,
        mainSymptoms: ['gi_issues', 'fatigue', 'brain_fog'] as const,
      };
    }),
    // Jan: spike after stopping anti-inflammatory
    ...Array.from({ length: 15 }, (_, i) => {
      const date = new Date('2026-01-01');
      date.setDate(date.getDate() + Math.floor(i * 2));
      return {
        date,
        painLevel: 6 + Math.floor(Math.random() * 3),
        isFlare: i % 4 === 0,
        mainSymptoms: ['gi_issues', 'joint_pain', 'fatigue', 'heart_symptoms'] as const,
      };
    }),
    // Feb-Mar: improving on immunosuppressant + biologic
    ...Array.from({ length: 25 }, (_, i) => {
      const date = new Date('2026-02-01');
      date.setDate(date.getDate() + Math.floor(i * 2.3));
      return {
        date,
        painLevel: Math.max(1, 4 - Math.floor(i / 8) + Math.floor(Math.random() * 2)),
        isFlare: i % 10 === 0,
        mainSymptoms: ['fatigue', 'brain_fog'] as const,
      };
    }),
  ];

  patterns.forEach((p, idx) => {
    const severities = ['mild', 'moderate', 'severe'] as const;
    const sevIdx = p.painLevel <= 3 ? 0 : p.painLevel <= 6 ? 1 : 2;
    symptoms.push({
      id: `s${idx + 1}`,
      date: p.date.toISOString().split('T')[0],
      painLevel: p.painLevel,
      symptoms: p.mainSymptoms.map(type => ({
        type,
        severity: severities[Math.min(sevIdx + (Math.random() > 0.5 ? 0 : -1 < 0 ? 0 : 0), 2)],
      })),
      notes: p.isFlare ? 'Significant flare day — multiple symptoms worsened.' : '',
      providerId: idx % 3 === 0 ? 'p1' : undefined,
      isFlareDay: p.isFlare,
    });
  });

  return symptoms;
};

export const sampleSymptoms: SymptomEntry[] = generateSymptoms();

export const sampleVisits: Visit[] = [
  { id: 'v1', date: '2025-10-05', providerId: 'p3', purpose: 'Initial consultation', notes: 'Referred to GI specialist. Started on Vitamin D supplementation.', linkedMedIds: ['m5'], linkedSymptomIds: ['s1', 's2'] },
  { id: 'v2', date: '2025-10-15', providerId: 'p1', purpose: 'GI evaluation', notes: 'Diagnosed IBS. Started Mesalamine and Dicyclomine. Recommended dietary changes.', linkedMedIds: ['m1', 'm3'], linkedSymptomIds: ['s3', 's4'] },
  { id: 'v3', date: '2025-11-20', providerId: 'p2', purpose: 'Rheumatology assessment', notes: 'Joint inflammation noted. Blood work ordered. Monitoring response to anti-inflammatory.', linkedMedIds: ['m1'], linkedSymptomIds: ['s15', 's16'] },
  { id: 'v4', date: '2025-12-18', providerId: 'p1', purpose: 'Follow-up', notes: 'Moderate improvement in GI symptoms. Transitioning from Mesalamine to Azathioprine for long-term management.', linkedMedIds: ['m1', 'm2'], linkedSymptomIds: ['s30', 's31'] },
  { id: 'v5', date: '2026-01-15', providerId: 'p2', purpose: 'Urgent follow-up', notes: 'Symptom flare after stopping anti-inflammatory. Azathioprine needs more time. Discussing biologic options.', linkedMedIds: ['m2'], linkedSymptomIds: ['s50', 's51'] },
  { id: 'v6', date: '2026-02-01', providerId: 'p4', purpose: 'Immunology consult', notes: 'Started Adalimumab. Comprehensive immune panel ordered. Expect improvement in 4-6 weeks.', linkedMedIds: ['m6'], linkedSymptomIds: ['s60'] },
  { id: 'v7', date: '2026-03-10', providerId: 'p4', purpose: 'Biologic follow-up', notes: 'Good response to Adalimumab. Pain and GI symptoms reducing. Fatigue persists — recommend sleep study.', linkedMedIds: ['m6'], linkedSymptomIds: ['s75', 's76'] },
];
