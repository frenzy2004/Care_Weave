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
  PieChart, Pie, Cell,
  ReferenceLine,
} from 'recharts';

const COLORS = [
  'hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(168, 76%, 36%)',
  'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(210, 40%, 60%)',
];

const confidenceStyles = (c: string) => {
  if (c === 'High') return { dot: 'bg-chart-teal', badge: 'bg-chart-teal/15 text-chart-teal border-chart-teal/30' };
  if (c === 'Medium') return { dot: 'bg-chart-amber', badge: 'bg-chart-amber/15 text-chart-amber border-chart-amber/30' };
  return { dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground border-border' };
};

const categoryAccent = (cat: string) => {
  switch (cat) {
    case 'improvement': return 'border-accent-teal';
    case 'warning': return 'border-accent-amber';
    case 'correlation': return 'border-accent-blue';
    default: return 'border-accent-amber';
  }
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

  const severityData = useMemo(() => {
    const sorted = [...symptoms].sort((a, b) => a.date.localeCompare(b.date));
    const weekly = new Map<string, number[]>();
    sorted.forEach(s => {
      const weekKey = s.date.substring(0, 7);
      if (!weekly.has(weekKey)) weekly.set(weekKey, []);
      weekly.get(weekKey)!.push(s.painLevel);
    });
    return Array.from(weekly.entries()).map(([month, pains]) => ({
      month: format(parseISO(month + '-01'), 'MMM yy'),
      avgPain: Math.round((pains.reduce((a, b) => a + b, 0) / pains.length) * 10) / 10,
      maxPain: Math.max(...pains),
    }));
  }, [symptoms]);

  const medTimeline = useMemo(() => {
    return medications.map(m => ({
      name: m.name,
      start: m.startDate,
      end: m.endDate || new Date().toISOString().split('T')[0],
      drugClass: m.drugClass,
    }));
  }, [medications]);

  const drugClassData = useMemo(() => {
    const counts = new Map<string, number>();
    medications.forEach(m => {
      const label = DRUG_CLASS_LABELS[m.drugClass];
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [medications]);

  const medMarkers = medications.map(m => ({
    month: format(parseISO(m.startDate), 'MMM yy'),
    name: m.name,
  }));

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">
        <span className="gradient-text">
          {doctorMode ? 'Clinical Pattern Analysis' : 'Insights & Patterns'}
        </span>
      </h1>

      {/* Insight Engine */}
      {insights.length > 0 && (
        <div className="space-y-3 animate-fade-in-up">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            {doctorMode ? 'Detected Clinical Insights' : '🧠 Detected Insights'}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((insight, i) => {
              const Icon = categoryIcon(insight.category);
              const styles = confidenceStyles(insight.confidence);
              return (
                <Card
                  key={insight.id}
                  className={`hover-lift ${categoryAccent(insight.category)} animate-fade-in-up`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground leading-relaxed">{insight.text}</p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                            <Badge className={styles.badge} variant="outline">
                              {insight.confidence}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {insight.instanceCount} instance{insight.instanceCount > 1 ? 's' : ''}
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
      <Card className="hover-lift animate-fade-in-up stagger-2">
        <CardHeader>
          <CardTitle className="text-sm">
            {doctorMode ? 'Pain Severity Trend (Monthly Average)' : 'Symptom Severity Over Time'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={severityData}>
                <defs>
                  <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px hsl(var(--foreground) / 0.08)',
                  }}
                />
                <Line type="monotone" dataKey="avgPain" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Avg Pain" />
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
        <Card className="hover-lift animate-fade-in-up stagger-3">
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
                  <div key={i} className="group">
                    <p className="text-xs font-medium text-foreground mb-1">{m.name}</p>
                    <div className="relative h-6 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full rounded-full transition-all group-hover:opacity-90"
                        style={{
                          left: `${Math.min(leftPct, 95)}%`,
                          width: `${Math.min(widthPct, 100 - leftPct)}%`,
                          background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                          opacity: 0.75,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Oct 2025</span><span>Mar 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drug Class Donut */}
        <Card className="hover-lift animate-fade-in-up stagger-4">
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
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
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
