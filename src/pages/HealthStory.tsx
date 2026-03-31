import { useMemo } from 'react';
import { useHealth } from '@/contexts/HealthDataContext';
import { generateHealthStory, HEALTH_STORY_DISCLAIMER } from '@/utils/healthStoryGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Info, Quote } from 'lucide-react';

const borderColors = [
  'border-l-primary', 'border-l-chart-teal', 'border-l-chart-purple',
  'border-l-chart-amber', 'border-l-chart-blue',
];

export default function HealthStory() {
  const { patient, symptoms, medications, visits, doctorMode } = useHealth();

  const paragraphs = useMemo(
    () => generateHealthStory(patient, symptoms, medications, visits, doctorMode),
    [patient, symptoms, medications, visits, doctorMode]
  );

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">
        <span className="gradient-text">
          {doctorMode ? 'Clinical Narrative Summary' : 'Your Health Journey'}
        </span>
      </h1>

      <Card className="hover-lift animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            {doctorMode ? `Patient: ${patient.name}` : `${patient.name}'s Story`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Opening quote decoration */}
          <div className="flex items-start gap-3 mb-4">
            <Quote className="h-8 w-8 text-primary/20 shrink-0 rotate-180" />
          </div>

          <div className="space-y-4 pl-2">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`text-sm leading-relaxed text-foreground border-l-2 pl-4 py-1 ${borderColors[i % borderColors.length]} animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {p}
              </p>
            ))}
          </div>

          {/* Disclaimer callout */}
          <div className="mt-8 flex items-start gap-3 bg-muted/50 rounded-xl p-4 border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs italic text-muted-foreground leading-relaxed">
              {HEALTH_STORY_DISCLAIMER}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
