import { SymptomEntry, Medication, Visit, Patient } from '@/types/health';
import { parseISO, format, differenceInMonths } from 'date-fns';

function avgPain(entries: SymptomEntry[]): number {
  if (!entries.length) return 0;
  return entries.reduce((s, e) => s + e.painLevel, 0) / entries.length;
}

export function generateHealthStory(
  patient: Patient,
  symptoms: SymptomEntry[],
  medications: Medication[],
  visits: Visit[],
  doctorMode: boolean,
): string[] {
  const sorted = [...symptoms].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return ['No symptom data available to generate a health story.'];

  const firstDate = parseISO(sorted[0].date);
  const lastDate = parseISO(sorted[sorted.length - 1].date);
  const months = Math.max(1, differenceInMonths(lastDate, firstDate));
  const totalEntries = sorted.length;
  const flareDays = sorted.filter(s => s.isFlareDay).length;

  // Find worst month
  const monthlyPain = new Map<string, number[]>();
  sorted.forEach(s => {
    const key = s.date.substring(0, 7);
    if (!monthlyPain.has(key)) monthlyPain.set(key, []);
    monthlyPain.get(key)!.push(s.painLevel);
  });

  let worstMonth = '';
  let worstAvg = 0;
  monthlyPain.forEach((pains, month) => {
    const avg = pains.reduce((a, b) => a + b, 0) / pains.length;
    if (avg > worstAvg) {
      worstAvg = avg;
      worstMonth = month;
    }
  });

  // Recent trend
  const recentSymptoms = sorted.slice(-10);
  const earlierSymptoms = sorted.slice(0, 10);
  const recentAvg = avgPain(recentSymptoms);
  const earlierAvg = avgPain(earlierSymptoms);
  const improvementPct = earlierAvg > 0 ? Math.round(((earlierAvg - recentAvg) / earlierAvg) * 100) : 0;

  // Most common symptom
  const symptomCount = new Map<string, number>();
  sorted.forEach(s => s.symptoms.forEach(sym => {
    symptomCount.set(sym.type, (symptomCount.get(sym.type) || 0) + 1);
  }));
  const mostCommon = [...symptomCount.entries()].sort((a, b) => b[1] - a[1])[0];

  const activeMeds = medications.filter(m => !m.endDate);
  const prefix = doctorMode ? `Patient ${patient.name}` : 'You';
  const possessive = doctorMode ? `Patient's` : 'Your';

  const paragraphs: string[] = [];

  // Opening
  const worstMonthLabel = worstMonth ? format(parseISO(worstMonth + '-01'), 'MMMM yyyy') : 'the early months';
  paragraphs.push(
    doctorMode
      ? `Clinical Summary: Over the past ${months} month${months > 1 ? 's' : ''}, ${patient.name} has logged ${totalEntries} symptom entries across ${months} month${months > 1 ? 's' : ''}, with ${flareDays} documented flare day${flareDays !== 1 ? 's' : ''}. Peak symptom severity was observed in ${worstMonthLabel} (avg pain: ${worstAvg.toFixed(1)}/10).`
      : `Over the past ${months} month${months > 1 ? 's' : ''}, ${prefix.toLowerCase()} have tracked ${totalEntries} symptom entries with ${flareDays} flare day${flareDays !== 1 ? 's' : ''}. ${possessive} symptoms were most severe in ${worstMonthLabel}.`
  );

  // Medication impact
  if (improvementPct > 0) {
    const medNames = activeMeds.map(m => m.name).join(', ');
    paragraphs.push(
      doctorMode
        ? `Following initiation of ${medNames || 'current treatment regimen'}, average pain severity decreased by approximately ${improvementPct}%. Current regimen includes ${activeMeds.length} active medication${activeMeds.length !== 1 ? 's' : ''}.`
        : `After starting ${medNames || 'your current medications'}, ${possessive.toLowerCase()} pain has reduced by about ${improvementPct}%. ${prefix} ${prefix === 'You' ? 'are' : 'is'} currently on ${activeMeds.length} active medication${activeMeds.length !== 1 ? 's' : ''}.`
    );
  } else if (improvementPct < 0) {
    paragraphs.push(
      doctorMode
        ? `Symptom severity has increased by approximately ${Math.abs(improvementPct)}% in recent entries compared to baseline. Treatment reassessment may be warranted.`
        : `${possessive} symptoms have increased by about ${Math.abs(improvementPct)}% recently. It may be worth discussing this with ${doctorMode ? 'the care team' : 'your doctor'}.`
    );
  }

  // Persistent symptom
  if (mostCommon) {
    const label = mostCommon[0].replace('_', ' ');
    paragraphs.push(
      doctorMode
        ? `Most frequently reported symptom: ${label} (${mostCommon[1]} occurrences). This symptom persists across treatment changes and may require targeted intervention.`
        : `${label.charAt(0).toUpperCase() + label.slice(1)} has been ${prefix.toLowerCase() === 'you' ? 'your' : 'the'} most consistent symptom, appearing in ${mostCommon[1]} entries. This pattern persists even as other symptoms improve.`
    );
  }

  // Visit summary
  if (visits.length > 0) {
    paragraphs.push(
      doctorMode
        ? `${visits.length} clinical visit${visits.length !== 1 ? 's' : ''} documented across ${new Set(visits.map(v => v.providerId)).size} provider${new Set(visits.map(v => v.providerId)).size !== 1 ? 's' : ''}.`
        : `${prefix} ${prefix === 'You' ? 'have' : 'has'} visited ${new Set(visits.map(v => v.providerId)).size} different provider${new Set(visits.map(v => v.providerId)).size !== 1 ? 's' : ''} across ${visits.length} appointment${visits.length !== 1 ? 's' : ''} during this period.`
    );
  }

  return paragraphs;
}

export const HEALTH_STORY_DISCLAIMER = "This report is meant to support conversations with your doctor, not replace medical advice.";
