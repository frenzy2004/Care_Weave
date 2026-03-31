import { SymptomEntry, Medication, Visit, TimelineEvent } from '@/types/health';

export function buildTimeline(
  symptoms: SymptomEntry[],
  medications: Medication[],
  visits: Visit[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  symptoms.forEach(s => {
    events.push({
      id: `te_${s.id}`,
      date: s.date,
      type: s.isFlareDay ? 'flare' : 'symptom',
      title: s.isFlareDay ? 'Symptom Flare' : 'Symptoms Logged',
      description: `Pain: ${s.painLevel}/10. ${s.symptoms.map(sym => sym.type.replace('_', ' ')).join(', ')}${s.notes ? `. ${s.notes}` : ''}`,
      providerId: s.providerId,
      sourceId: s.id,
    });
  });

  medications.forEach(m => {
    events.push({
      id: `te_${m.id}_start`,
      date: m.startDate,
      type: 'medication_start',
      title: `Medication Started: ${m.name}`,
      description: `${m.dosage}, ${m.frequency} (${m.drugClass})`,
      providerId: m.providerId,
      sourceId: m.id,
    });
    if (m.endDate) {
      events.push({
        id: `te_${m.id}_stop`,
        date: m.endDate,
        type: 'medication_stop',
        title: `Medication Stopped: ${m.name}`,
        description: `Discontinued ${m.name} (${m.drugClass})`,
        providerId: m.providerId,
        sourceId: m.id,
      });
    }
  });

  visits.forEach(v => {
    events.push({
      id: `te_${v.id}`,
      date: v.date,
      type: 'visit',
      title: 'Visit Outcome',
      description: v.notes ? `${v.purpose}. ${v.notes}` : v.purpose,
      providerId: v.providerId,
      sourceId: v.id,
    });
  });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}
