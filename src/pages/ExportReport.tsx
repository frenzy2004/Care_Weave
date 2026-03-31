import { useRef, useState } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { generateInsights } from '@/utils/insightEngine';
import { generateHealthStory, HEALTH_STORY_DISCLAIMER } from '@/utils/healthStoryGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DRUG_CLASS_LABELS } from '@/types/health';
import { FileDown, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportReport() {
  const { patient, symptoms, medications, visits, providers, doctorMode } = useHealth();
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const insights = generateInsights(symptoms, medications);
  const story = generateHealthStory(patient, symptoms, medications, visits, doctorMode);
  const activeMeds = medications.filter(m => !m.endDate);
  const recentVisits = [...visits].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const sorted = [...symptoms].sort((a, b) => a.date.localeCompare(b.date));
  const recent10 = sorted.slice(-10);
  const earlier10 = sorted.slice(0, 10);
  const recentAvg = recent10.length ? recent10.reduce((s, e) => s + e.painLevel, 0) / recent10.length : 0;
  const earlierAvg = earlier10.length ? earlier10.reduce((s, e) => s + e.painLevel, 0) / earlier10.length : 0;
  const changePct = earlierAvg > 0 ? Math.round(((earlierAvg - recentAvg) / earlierAvg) * 100) : 0;

  const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || 'Unknown';

  const handleExport = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CareWeave_Report_${patient.name.replace(/\s/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Generate Clinical Report' : 'Export Report'}
        </h1>
        <Button onClick={handleExport} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Download PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-white p-8 space-y-6 text-gray-900 rounded-lg">
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-4">
          <h1 className="text-2xl font-bold text-blue-600">CareWeave Health Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated {format(new Date(), 'MMMM d, yyyy')} • {doctorMode ? 'Clinical Format' : 'Patient Format'}
          </p>
        </div>

        {/* Patient Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
          <p className="text-sm text-gray-700">Name: {patient.name}</p>
          <p className="text-sm text-gray-700">Conditions: {patient.conditions.join(', ')}</p>
          <p className="text-sm font-medium text-blue-600 mt-2">
            {changePct > 0 ? `Symptoms improved ${changePct}%` : changePct < 0 ? `Symptoms increased ${Math.abs(changePct)}%` : 'Symptoms stable'} over tracking period
          </p>
        </div>

        {/* Health Story */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {doctorMode ? 'Clinical Summary' : 'Health Journey'}
          </h2>
          {story.map((p, i) => (
            <p key={i} className="text-sm text-gray-700 mt-2">{p}</p>
          ))}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Detected Insights</h2>
            <ul className="mt-2 space-y-2">
              {insights.map(ins => (
                <li key={ins.id} className="text-sm text-gray-700">
                  • {ins.text} — <span className="text-gray-500">Confidence: {ins.confidence} ({ins.instanceCount} instances)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Active Medications */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Medications</h2>
          <table className="w-full mt-2 text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 text-gray-600">Medication</th>
                <th className="text-left py-1 text-gray-600">Dosage</th>
                <th className="text-left py-1 text-gray-600">Class</th>
                <th className="text-left py-1 text-gray-600">Started</th>
              </tr>
            </thead>
            <tbody>
              {activeMeds.map(m => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-1">{m.name}</td>
                  <td className="py-1">{m.dosage}, {m.frequency}</td>
                  <td className="py-1">{DRUG_CLASS_LABELS[m.drugClass]}</td>
                  <td className="py-1">{format(parseISO(m.startDate), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Visits */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
          <div className="mt-2 space-y-2">
            {recentVisits.map(v => (
              <div key={v.id} className="text-sm text-gray-700">
                <span className="font-medium">{format(parseISO(v.date), 'MMM d, yyyy')}</span> —{' '}
                {getProviderName(v.providerId)}: {v.purpose}. {v.notes}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs italic text-gray-400 pt-4 border-t border-gray-200">
          {HEALTH_STORY_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
