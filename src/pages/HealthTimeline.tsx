import { useState, useMemo } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { buildTimeline } from '@/utils/timelineBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventType } from '@/types/health';
import { format, parseISO } from 'date-fns';
import { Activity, Pill, Calendar, Flame, FileText, StopCircle } from 'lucide-react';

const typeIcons: Record<EventType, React.ElementType> = {
  symptom: Activity, flare: Flame, medication_start: Pill,
  medication_stop: StopCircle, visit: Calendar, note: FileText,
};

const typeGradients: Record<EventType, string> = {
  symptom: 'bg-gradient-to-br from-chart-amber/20 to-chart-amber/5 text-chart-amber border-chart-amber/30',
  flare: 'bg-gradient-to-br from-chart-red/20 to-chart-red/5 text-chart-red border-chart-red/30',
  medication_start: 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary border-primary/30',
  medication_stop: 'bg-muted text-muted-foreground border-border',
  visit: 'bg-gradient-to-br from-chart-teal/20 to-chart-teal/5 text-chart-teal border-chart-teal/30',
  note: 'bg-muted text-muted-foreground border-border',
};

const typeBorderAccent: Record<EventType, string> = {
  symptom: 'border-accent-amber',
  flare: 'border-accent-red',
  medication_start: 'border-accent-blue',
  medication_stop: '',
  visit: 'border-accent-teal',
  note: '',
};

export default function HealthTimeline() {
  const { symptoms, medications, visits, providers, doctorMode } = useHealth();
  const [filter, setFilter] = useState<string>('all');

  const timeline = useMemo(() => {
    const all = buildTimeline(symptoms, medications, visits);
    if (filter === 'all') return all;
    return all.filter(e => e.type === filter);
  }, [symptoms, medications, visits, filter]);

  const getProviderName = (id?: string) => id ? providers.find(p => p.id === id)?.name : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {doctorMode ? 'Clinical Timeline' : 'Health Timeline'}
        </h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="symptom">Symptoms</SelectItem>
            <SelectItem value="flare">Flares</SelectItem>
            <SelectItem value="medication_start">Med Started</SelectItem>
            <SelectItem value="medication_stop">Med Stopped</SelectItem>
            <SelectItem value="visit">Visits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        {/* Gradient timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/40 to-border" />

        <div className="space-y-4">
          {timeline.map((event, i) => {
            const Icon = typeIcons[event.type];
            const providerName = getProviderName(event.providerId);
            return (
              <div
                key={event.id}
                className="relative flex gap-4 pl-2 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${typeGradients[event.type]} transition-transform hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Card className={`flex-1 hover-lift ${typeBorderAccent[event.type]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{event.title}</span>
                      <Badge variant="outline" className="text-[10px] bg-muted/50">
                        {format(parseISO(event.date), 'MMM d, yyyy')}
                      </Badge>
                      {providerName && (
                        <Badge variant="secondary" className="text-[10px]">{providerName}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
