import { SymptomEntry, Medication, Insight, ConfidenceLevel } from '@/types/health';
import { parseISO, isBefore, isAfter, differenceInDays } from 'date-fns';

function getConfidence(count: number): ConfidenceLevel {
  if (count >= 5) return 'High';
  if (count >= 3) return 'Medium';
  return 'Low';
}

function avgPain(entries: SymptomEntry[]): number {
  if (!entries.length) return 0;
  return entries.reduce((s, e) => s + e.painLevel, 0) / entries.length;
}

export function generateInsights(symptoms: SymptomEntry[], medications: Medication[]): Insight[] {
  const insights: Insight[] = [];
  const sorted = [...symptoms].sort((a, b) => a.date.localeCompare(b.date));

  // 1. Check symptom change after each medication start
  medications.forEach(med => {
    const medStart = parseISO(med.startDate);
    const before = sorted.filter(s => {
      const d = parseISO(s.date);
      return isBefore(d, medStart) && differenceInDays(medStart, d) <= 30;
    });
    const after = sorted.filter(s => {
      const d = parseISO(s.date);
      return isAfter(d, medStart) && differenceInDays(d, medStart) <= 30;
    });

    if (before.length >= 2 && after.length >= 2) {
      const avgBefore = avgPain(before);
      const avgAfter = avgPain(after);
      const count = before.length + after.length;

      if (avgAfter < avgBefore * 0.75) {
        insights.push({
          id: `ins_improve_${med.id}`,
          text: `Symptoms improved after starting ${med.name} (${med.drugClass})`,
          confidence: getConfidence(count),
          instanceCount: count,
          category: 'improvement',
        });
      } else if (avgAfter > avgBefore * 1.25) {
        insights.push({
          id: `ins_worsen_${med.id}`,
          text: `Symptoms worsened after starting ${med.name} — discuss with your provider`,
          confidence: getConfidence(count),
          instanceCount: count,
          category: 'warning',
        });
      }
    }
  });

  // 2. Flare frequency
  const flareDays = sorted.filter(s => s.isFlareDay);
  if (flareDays.length >= 3) {
    const recentFlares = flareDays.filter(f => differenceInDays(new Date(), parseISO(f.date)) <= 60);
    const olderFlares = flareDays.filter(f => {
      const diff = differenceInDays(new Date(), parseISO(f.date));
      return diff > 60 && diff <= 120;
    });
    if (recentFlares.length < olderFlares.length && olderFlares.length > 0) {
      insights.push({
        id: 'ins_flare_decrease',
        text: 'Flare frequency has decreased in the past 2 months compared to before',
        confidence: getConfidence(flareDays.length),
        instanceCount: flareDays.length,
        category: 'improvement',
      });
    } else if (recentFlares.length > olderFlares.length && recentFlares.length >= 2) {
      insights.push({
        id: 'ins_flare_increase',
        text: 'Flare frequency has increased recently — monitor closely',
        confidence: getConfidence(flareDays.length),
        instanceCount: flareDays.length,
        category: 'warning',
      });
    }
  }

  // 3. Symptom type correlations
  const symptomTypes = new Map<string, number[]>();
  sorted.forEach(s => {
    s.symptoms.forEach(sym => {
      if (!symptomTypes.has(sym.type)) symptomTypes.set(sym.type, []);
      symptomTypes.get(sym.type)!.push(s.painLevel);
    });
  });

  const fatigueEntries = symptomTypes.get('fatigue');
  if (fatigueEntries && fatigueEntries.length >= 5) {
    const avgFatigue = fatigueEntries.reduce((a, b) => a + b, 0) / fatigueEntries.length;
    if (avgFatigue > 5) {
      insights.push({
        id: 'ins_fatigue_persistent',
        text: 'Fatigue remains persistent across your health journey — consider discussing targeted treatment',
        confidence: getConfidence(fatigueEntries.length),
        instanceCount: fatigueEntries.length,
        category: 'pattern',
      });
    }
  }

  // 4. Medication gap detection
  const activeMedDates = new Set<string>();
  medications.forEach(med => {
    const start = parseISO(med.startDate);
    const end = med.endDate ? parseISO(med.endDate) : new Date();
    let current = new Date(start);
    while (current <= end) {
      activeMedDates.add(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  });

  const noMedSymptoms = sorted.filter(s => !activeMedDates.has(s.date));
  const withMedSymptoms = sorted.filter(s => activeMedDates.has(s.date));
  if (noMedSymptoms.length >= 3 && withMedSymptoms.length >= 3) {
    const avgNoMed = avgPain(noMedSymptoms);
    const avgWithMed = avgPain(withMedSymptoms);
    if (avgNoMed > avgWithMed * 1.3) {
      insights.push({
        id: 'ins_med_gap',
        text: 'Symptoms spike when no medication is active — maintaining consistent treatment appears beneficial',
        confidence: getConfidence(noMedSymptoms.length),
        instanceCount: noMedSymptoms.length,
        category: 'correlation',
      });
    }
  }

  return insights;
}
