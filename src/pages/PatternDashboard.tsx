import { useMemo } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { generateInsights } from '@/utils/insightEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DRUG_CLASS_LABELS } from '@/types/health';
import { Brain, TrendingDown, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, ReferenceLine,
} from 'recharts';

const COLORS = [
  'hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(168, 76%, 32%)',
  'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(210, 40%, 60%)',
];

const confidenceColor = (c: string) => {
  if (c === 'High') return 'bg-chart-teal/15 text-chart-teal';
  if (c === 'Medium') return 'bg-chart-amber/15 text-chart-amber';
  return 'bg-muted text-muted-foreground';
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'improvement': return TrendingDown;
    case 'warning': return AlertTriangle;
    case 'correlation': return Activity;
    default: return Brain;
  }
};

export default function PatternDashboard() {
  const { symptoms, medications, doctorMode } = useHealth();

  const insights = useMemo(() => generateInsights(symptoms, medications), [symptoms, medications]);

  // Symptom severity over time
  const severityData = useMemo(() => {
    const sorted = [...symptoms].sort((a, b) => a.date.localeCompare(b.date));
    const weekly = new Map<string, number[]>();
    sorted.forEach(s => {
      const weekKey = s.date.substring(0, 7); // month grouping
      if (!weekly.has(weekKey)) weekly.set(weekKey, []);
      weekly.get(weekKey)!.push(s.painLevel);
    });
    return Array.from(weekly.entries()).map(([month, pains]) => ({
      month: format(parseISO(month + '-01'), 'MMM yy'),
      avgPain: Math.round((pains.reduce((a, b) => a + b, 0) / pains.length) * 10) / 10,
      maxPain: Math.max(...pains),
    }));
  }, [symptoms]);

  // Medication timeline (Gantt)
  const medTimeline = useMemo(() => {
    return medications.map(m => ({
      name: m.name,
      start: m.startDate,
      end: m.endDate || new Date().toISOString().split('T')[0],
      drugClass: m.drugClass,
    }));
  }, [medications]);

  // Drug class pie
  const drugClassData = useMemo(() => {
    const counts = new Map<string, number>();
    medications.forEach(m => {
      const label = DRUG_CLASS_LABELS[m.drugClass];
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [medications]);

  // Med start markers for the line chart
  const medMarkers = medications.map(m => ({
    month: format(parseISO(m.startDate), 'MMM yy'),
    name: m.name,
  }));

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {doctorMode ? 'Clinical Pattern Analysis' : 'Insights & Patterns'}
      </h1>

      {/* Insight Engine */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {doctorMode ? 'Detected Clinical Insights' : '🧠 Detected Insights'}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map(insight => {
              const Icon = categoryIcon(insight.category);
              return (
                <Card key={insight.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{insight.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={confidenceColor(insight.confidence)} variant="outline">
                            Confidence: {insight.confidence}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            (based on {insight.instanceCount} instances)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Symptom Severity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {doctorMode ? 'Pain Severity Trend (Monthly Average)' : 'Symptom Severity Over Time'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="avgPain" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Avg Pain" />
                <Line type="monotone" dataKey="maxPain" stroke="hsl(var(--chart-red))" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Max Pain" />
                {medMarkers.map((m, i) => (
                  <ReferenceLine key={i} x={m.month} stroke="hsl(var(--chart-teal))" strokeDasharray="3 3" label={{ value: m.name, fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Medication Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Medication Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medTimeline.map((m, i) => {
                const start = parseISO(m.start);
                const end = parseISO(m.end);
                const totalDays = 180;
                const refStart = parseISO('2025-10-01');
                const leftPct = Math.max(0, ((start.getTime() - refStart.getTime()) / (totalDays * 86400000)) * 100);
                const widthPct = Math.max(5, ((end.getTime() - start.getTime()) / (totalDays * 86400000)) * 100);
                return (
                  <div key={i}>
                    <p className="text-xs font-medium text-foreground mb-1">{m.name}</p>
                    <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          left: `${Math.min(leftPct, 95)}%`,
                          width: `${Math.min(widthPct, 100 - leftPct)}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Oct 2025</span>
                <span>Mar 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drug Class Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Treatment Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={drugClassData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {drugClassData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
