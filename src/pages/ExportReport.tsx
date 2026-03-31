import { useRef, useState } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { generateInsights } from '@/utils/insightEngine';
import { generateHealthStory, HEALTH_STORY_DISCLAIMER } from '@/utils/healthStoryGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DRUG_CLASS_LABELS } from '@/types/health';
import { FileDown, Loader2, Printer, FileText } from 'lucide-react';
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
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
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
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={loading} className="gap-2 gradient-primary border-0 text-white shadow-md hover:shadow-lg transition-shadow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Download PDF
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="gap-2 hover-lift">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      <Card className="hover-lift shadow-xl shadow-foreground/5 transition-shadow hover:shadow-2xl">
        <div ref={reportRef} className="bg-white text-gray-900 p-8 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">CareWeave Health Report</h2>
                <p className="text-sm text-gray-500">
                  Generated {format(new Date(), 'MMMM d, yyyy')} • {doctorMode ? 'Clinical Format' : 'Patient Format'}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">Patient Information</h3>
            <div className="grid grid-cols-2 text-sm gap-1">
              <p><span className="text-gray-500">Name:</span> {patient.name}</p>
              <p><span className="text-gray-500">Conditions:</span> {patient.conditions.join(', ')}</p>
            </div>
            <p className="text-sm font-medium text-blue-600 mt-2">
              {changePct > 0 ? `Symptoms improved ${changePct}%` : changePct < 0 ? `Symptoms increased ${Math.abs(changePct)}%` : 'Symptoms stable'} over tracking period
            </p>
          </div>

          {/* Health Story */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">{doctorMode ? 'Clinical Summary' : 'Health Journey'}</h3>
            {story.map((p, i) => <p key={i} className="text-sm text-gray-700 mb-2 leading-relaxed">{p}</p>)}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Detected Insights</h3>
              <ul className="space-y-2">
                {insights.map(ins => (
                  <li key={ins.id} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{ins.text} <span className="text-gray-400 text-xs">(Confidence: {ins.confidence}, {ins.instanceCount} instances)</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Active Medications */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Active Medications</h3>
            <table className="w-full text-sm">
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
            <h3 className="font-bold text-gray-800 mb-2">Recent Visits</h3>
            <div className="space-y-2">
              {recentVisits.map(v => (
                <div key={v.id} className="text-sm text-gray-700">
                  <span className="font-medium">{format(parseISO(v.date), 'MMM d, yyyy')}</span> — {getProviderName(v.providerId)}: {v.purpose}. {v.notes}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs italic text-gray-400">{HEALTH_STORY_DISCLAIMER}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
