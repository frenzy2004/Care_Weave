import { useHealth } from '@/contexts/HealthDataContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pill, Calendar, Flame, TrendingDown, TrendingUp, Activity, Minus } from 'lucide-react';
import { buildTimeline } from '@/utils/timelineBuilder';
import { format, parseISO, differenceInDays } from 'date-fns';

const EVENT_ICONS: Record<string, string> = {
  symptom: '🔴',
  flare: '🔥',
  medication_start: '💊',
  medication_stop: '⏹️',
  visit: '🩺',
  note: '📝',
};

const EVENT_ICONS_CLINICAL: Record<string, string> = {
  symptom: '•',
  flare: '▲',
  medication_start: '+Rx',
  medication_stop: '-Rx',
  visit: 'Visit',
  note: 'Note',
};

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

  // 7-day sparkline data
  const last7 = sorted.slice(-7);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? `Patient Overview: ${patient.name}` : `Welcome back, ${patient.name}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {patient.conditions.join(' • ')}
        </p>
      </div>

      {/* Headline Metric */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex items-center gap-4">
          {changePct > 0 ? (
            <TrendingDown className="h-10 w-10 text-chart-teal" />
          ) : changePct < 0 ? (
            <TrendingUp className="h-10 w-10 text-chart-red" />
          ) : (
            <Minus className="h-10 w-10 text-muted-foreground" />
          )}
          <div>
            <p className="text-2xl font-bold text-foreground">
              {changePct > 0
                ? `Symptoms improved ${changePct}% this month`
                : changePct < 0
                ? `Symptoms increased ${Math.abs(changePct)}% recently`
                : 'Symptoms are stable'}
            </p>
            <p className="text-sm text-muted-foreground">
              {doctorMode
                ? `Based on ${sorted.length} logged entries over ${totalDays} days`
                : 'Compared to when you started tracking'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/log-symptom')} className="gap-2">
          <PlusCircle className="h-4 w-4" /> Log Symptom
        </Button>
        <Button onClick={() => navigate('/medications')} variant="outline" className="gap-2">
          <Pill className="h-4 w-4" /> Add Medication
        </Button>
        <Button onClick={() => navigate('/visits')} variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" /> Record Visit
        </Button>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => navigate('/log-symptom?flare=true')}
        >
          <Flame className="h-4 w-4" /> {doctorMode ? 'Log Flare Event' : '🔥 Flare Day'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{activeMeds.length}</p>
            <p className="text-sm text-muted-foreground">Active Medications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{totalDays}</p>
            <p className="text-sm text-muted-foreground">Days Tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-chart-red">{flareDays}</p>
            <p className="text-sm text-muted-foreground">Flare Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-chart-teal">{visits.length}</p>
            <p className="text-sm text-muted-foreground">Provider Visits</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Sparkline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {doctorMode ? '7-Day Pain Severity Trend' : '7-Day Symptom Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-16">
            {last7.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-primary/80"
                  style={{ height: `${(s.painLevel / 10) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{s.painLevel}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeline.map(event => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <span className="text-lg leading-none mt-0.5">{icons[event.type] || '•'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{event.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {format(parseISO(event.date), 'MMM d')}
                    </Badge>
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
