import { useHealth } from '@/contexts/HealthDataContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pill, Calendar, Flame, TrendingDown, TrendingUp, Activity, Minus, ArrowRight } from 'lucide-react';
import { buildTimeline } from '@/utils/timelineBuilder';
import { format, parseISO, differenceInDays } from 'date-fns';

const EVENT_ICONS: Record<string, string> = {
  symptom: '🔴', flare: '🔥', medication_start: '💊',
  medication_stop: '⏹️', visit: '🩺', note: '📝',
};
const EVENT_ICONS_CLINICAL: Record<string, string> = {
  symptom: '•', flare: '▲', medication_start: '+Rx',
  medication_stop: '-Rx', visit: 'Visit', note: 'Note',
};

const statAccents = [
  { gradient: 'from-primary to-chart-purple', text: 'text-primary' },
  { gradient: 'from-chart-teal to-primary', text: 'text-chart-teal' },
  { gradient: 'from-chart-red to-chart-amber', text: 'text-chart-red' },
  { gradient: 'from-chart-teal to-chart-blue', text: 'text-chart-teal' },
];

export default function Dashboard() {
  const { patient, symptoms, medications, visits, doctorMode } = useHealth();
  const navigate = useNavigate();

  const sorted = [...symptoms].sort((a, b) => a.date.localeCompare(b.date));
  const recent10 = sorted.slice(-10);
  const earlier10 = sorted.slice(0, 10);
  const recentAvg = recent10.length ? recent10.reduce((s, e) => s + e.painLevel, 0) / recent10.length : 0;
  const earlierAvg = earlier10.length ? earlier10.reduce((s, e) => s + e.painLevel, 0) / earlier10.length : 0;
  const changePct = earlierAvg > 0 ? Math.round(((earlierAvg - recentAvg) / earlierAvg) * 100) : 0;

  const activeMeds = medications.filter(m => !m.endDate);
  const totalDays = sorted.length >= 2 ? differenceInDays(parseISO(sorted[sorted.length - 1].date), parseISO(sorted[0].date)) : 0;
  const flareDays = symptoms.filter(s => s.isFlareDay).length;

  const timeline = buildTimeline(symptoms, medications, visits).slice(0, 5);
  const icons = doctorMode ? EVENT_ICONS_CLINICAL : EVENT_ICONS;
  const last7 = sorted.slice(-7);

  const stats = [
    { value: activeMeds.length, label: 'Active Medications' },
    { value: totalDays, label: 'Days Tracked' },
    { value: flareDays, label: 'Flare Days' },
    { value: visits.length, label: 'Provider Visits' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? `Patient Overview: ${patient.name}` : `Welcome back, ${patient.name}`}
        </h1>
        <p className="text-muted-foreground mt-1">{patient.conditions.join(' • ')}</p>
      </div>

      {/* Hero Metric — Gradient Card */}
      <div className="animate-fade-in-up stagger-1">
        <Card className={`relative overflow-hidden border-0 ${
          changePct > 0 ? 'bg-gradient-to-br from-chart-teal/10 via-primary/5 to-transparent glow-teal' :
          changePct < 0 ? 'bg-gradient-to-br from-chart-red/10 via-chart-amber/5 to-transparent glow-red' :
          'bg-gradient-to-br from-muted to-transparent'
        }`}>
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-5 relative">
            <div className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-2xl shrink-0 ${
              changePct > 0 ? 'bg-chart-teal/15' : changePct < 0 ? 'bg-chart-red/15' : 'bg-muted'
            }`}>
              {changePct > 0 ? (
                <TrendingDown className="h-7 w-7 text-chart-teal" />
              ) : changePct < 0 ? (
                <TrendingUp className="h-7 w-7 text-chart-red" />
              ) : (
                <Minus className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {changePct > 0 ? `Symptoms improved ${changePct}%` :
                 changePct < 0 ? `Symptoms increased ${Math.abs(changePct)}%` : 'Symptoms are stable'}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {doctorMode ? `Based on ${sorted.length} entries over ${totalDays} days` : 'Compared to when you started tracking'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 animate-fade-in-up stagger-2 [&>*]:flex-1 [&>*]:sm:flex-none">
        <Button onClick={() => navigate('/log-symptom')} className="gap-2 gradient-primary border-0 text-white shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="h-4 w-4" /> Log Symptom
        </Button>
        <Button onClick={() => navigate('/medications')} variant="outline" className="gap-2 hover-lift">
          <Pill className="h-4 w-4" /> Add Medication
        </Button>
        <Button onClick={() => navigate('/visits')} variant="outline" className="gap-2 hover-lift">
          <Calendar className="h-4 w-4" /> Record Visit
        </Button>
        <Button
          className="gap-2 bg-destructive text-destructive-foreground border-0 animate-pulse-glow w-full sm:w-auto"
          onClick={() => navigate('/log-symptom?flare=true')}
        >
          <Flame className="h-4 w-4" /> {doctorMode ? 'Log Flare Event' : '🔥 Flare Day'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up stagger-3">
        {stats.map((stat, i) => (
          <Card key={i} className="hover-lift relative overflow-hidden group">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statAccents[i].gradient}`} />
            <CardContent className="p-4 text-center pt-5">
              <p className={`text-3xl font-bold ${statAccents[i].text}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 7-Day Sparkline */}
      <Card className="animate-fade-in-up stagger-4 hover-lift">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            {doctorMode ? '7-Day Pain Severity Trend' : '7-Day Symptom Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-20">
            {last7.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full relative rounded-md overflow-hidden" style={{ height: `${(s.painLevel / 10) * 100}%` }}>
                  <div className="absolute inset-0 gradient-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{s.painLevel}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Timeline */}
      <Card className="animate-fade-in-up stagger-5 hover-lift">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={() => navigate('/timeline')}>
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeline.map((event, i) => (
              <div key={event.id} className="flex items-start gap-3 text-sm group hover:bg-accent/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <span className="text-lg leading-none mt-0.5">{icons[event.type] || '•'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{event.title}</span>
                    <Badge variant="outline" className="text-[10px] border-border/50">{format(parseISO(event.date), 'MMM d')}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 truncate">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
